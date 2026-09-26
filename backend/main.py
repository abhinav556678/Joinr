import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase Client
SUPABASE_URL = os.getenv("EXPO_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Missing Supabase environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Initialize Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

class MatchRequest(BaseModel):
    user1_id: str
    user2_id: str

@app.post("/calculate-match")
async def calculate_match(req: MatchRequest):
    # 1. Check if match already exists in DB
    try:
        # User order shouldn't matter, but we check specifically this combination
        # To be safe, we can check both directions or enforce alphabetical ordering
        u1, u2 = sorted([req.user1_id, req.user2_id])
        existing_match = supabase.table("matches").select("*").eq("user_a_id", u1).eq("user_b_id", u2).execute()
        if existing_match.data:
            return existing_match.data[0]
    except Exception as e:
        print(f"Error checking existing matches: {e}")

    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing on the server.")

    # 2. Fetch user profiles from DB
    user1_res = supabase.table("users").select("id, name, manual_bio, intent_status, developer_metrics(trust_score)").eq("id", req.user1_id).execute()
    user2_res = supabase.table("users").select("id, name, manual_bio, intent_status, developer_metrics(trust_score)").eq("id", req.user2_id).execute()

    if not user1_res.data or not user2_res.data:
        raise HTTPException(status_code=404, detail="One or both users not found.")

    user1 = user1_res.data[0]
    user2 = user2_res.data[0]

    # 3. Call LLM for score and reasoning
    prompt = f"""
    You are an AI matchmaking engine for developers.
    Analyze the compatibility between these two developers.
    
    Developer 1:
    Name: {user1.get('name')}
    Bio: {user1.get('manual_bio')}
    Intent: {user1.get('intent_status')}
    
    Developer 2:
    Name: {user2.get('name')}
    Bio: {user2.get('manual_bio')}
    Intent: {user2.get('intent_status')}

    Return your assessment as a JSON object with two keys:
    - "score": an integer from 0 to 100 representing compatibility.
    - "reasoning": a short string (1-2 sentences) explaining why.
    """

    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        result = json.loads(response.text)
        score = int(result.get("score", 0))
        reasoning = str(result.get("reasoning", ""))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Generation failed: {str(e)}")

    # 4. Save to database
    u1, u2 = sorted([req.user1_id, req.user2_id])
    match_data = {
        "user_a_id": u1,
        "user_b_id": u2,
        "ai_match_score": score,
        "ai_reasoning": reasoning
    }

    try:
        inserted = supabase.table("matches").insert(match_data).execute()
        if inserted.data:
            return inserted.data[0]
    except Exception as e:
        # If the table doesn't exist yet, we can't save but we can still return the score
        print(f"Error saving match to DB: {e}")
        return match_data
    
    return match_data
