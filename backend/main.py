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

def format_developer_profile(user):
    return f"Name: {user.get('name')}\nBio: {user.get('manual_bio')}\nIntent: {user.get('intent_status')}"

class MatchRequest(BaseModel):
    user1_id: str
    user2_id: str

@app.post("/calculate-match")
async def calculate_match(req: MatchRequest):
    # Sort user IDs once to ensure a consistent match key
    u1, u2 = sorted([req.user1_id, req.user2_id])

    # 1. Check if match already exists in DB
    try:
        existing_match = supabase.table("matches").select("*").eq("user_a_id", u1).eq("user_b_id", u2).execute()
        if existing_match.data:
            return existing_match.data[0]
    except Exception as e:
        print(f"Error checking existing matches: {e}")

    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing on the server.")

    # 2. Fetch user profiles from DB in a single query
    users_res = supabase.table("users").select("id, name, manual_bio, intent_status").in_("id", [u1, u2]).execute()

    if not users_res.data or len(users_res.data) < 2:
        raise HTTPException(status_code=404, detail="One or both users not found.")

    # We don't strictly know which is which in the array, but it doesn't matter for the LLM
    user1 = users_res.data[0]
    user2 = users_res.data[1]

    # 3. Call LLM for score and reasoning
    prompt = f"""
    You are an AI matchmaking engine for developers.
    Analyze the compatibility between these two developers.
    
    Developer 1:
    {format_developer_profile(user1)}
    
    Developer 2:
    {format_developer_profile(user2)}

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
