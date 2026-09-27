# 05 — Real-Time Chat Integration

**What to build:** A user clicks "Connect" on a profile card and sends an introductory message. The app navigates to a Chat UI where both users can message each other instantly using Supabase Realtime WebSockets.

**Blocked by:** 03 — Discovery Feed & Intent Filtering

**Status:** ready-for-agent

- [x] UI: Create a "Connect" button on profile cards that opens a text input modal for an introductory message.
- [x] DB: Clicking send creates a row in the `matches` table (status: CONNECTED) and the `messages` table.
- [x] UI: Build a standard Chat Screen (bubbles left/right).
- [x] DB/State: Subscribe to Supabase WebSockets on the `messages` table so new texts appear instantly without refreshing the screen.
