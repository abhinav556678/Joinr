# 03 — Discovery Feed & Intent Filtering

**What to build:** A user can toggle their Intent Status ("Looking to Join" vs. "Recruiting"). The Home screen renders a vertical, scrolling feed of profile cards populated by querying the Supabase `users` and `developer_metrics` tables for developers with complementary intents.

**Blocked by:** 01 — Auth & Onboarding Foundation

**Status:** ready-for-agent

- [x] State/DB: Add a toggle in the UI that updates the `intent_status` column in the `users` table.
- [x] UI: Build a highly polished, vertical scrolling list of Profile Cards.
- [x] DB: Write a Supabase query that fetches users whose `intent_status` complements the current user's status.
- [x] UI: Render the fetched users into the Profile Cards, showing their manual bio and Trust Score.
