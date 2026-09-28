# 02 — Messages Tab & Chat History

**What to build:** A new "Messages" tab on the bottom navigation bar alongside Settings, Community, etc. This screen acts as the hub for all user chats, displaying a scrollable list of all active or past conversation threads the user is a part of.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Add a new tab screen to the Expo Router bottom tabs configuration (`app/(tabs)/messages.js` or similar).
- [ ] Fetch the user's active matches/conversations from the `matches` table.
- [ ] Display a list of these conversations with the other person's name and the latest message snippet.
- [ ] Clicking a conversation navigates to the direct messaging thread.
