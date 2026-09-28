# 04 — AI Matchmaking Engine (FastAPI)

**What to build:** When a user taps a profile card in the feed, a Python FastAPI server takes both users' profiles, asks an LLM (OpenAI/Gemini) for a compatibility score, saves the result to the `matches` table, and returns it to the React Native app. The UI updates to display the glowing "0-100 Score" and reasoning.

**Blocked by:** 03 — Discovery Feed & Intent Filtering

**Status:** ready-for-agent

- [x] Backend: Set up a basic Python FastAPI server with an endpoint `/calculate-match`.
- [x] API: Integrate Gemini/OpenAI SDK in the Python backend with a strict prompt format.
- [x] Backend/DB: Python successfully saves the calculated score to the `matches` table to act as a cache.
- [x] Frontend: The React Native app hits the FastAPI endpoint when viewing a profile, displaying a skeleton loader until the score resolves.
