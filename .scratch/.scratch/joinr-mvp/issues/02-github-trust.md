# 02 — GitHub/LeetCode Trust Integration

**What to build:** A user can navigate to their profile settings, input their GitHub/LeetCode usernames, and press "Verify." The app fetches their live external data, stores the raw JSON in the `developer_metrics` table, calculates their "Trust Score," and immediately reflects this score and their top languages on their UI profile.

**Blocked by:** 01 — Auth & Onboarding Foundation

**Status:** done

- [x] UI: Build a "Verify Developer Profile" section in the settings tab.
- [x] API: Fetch public JSON from GitHub/LeetCode based on inputted usernames.
- [x] DB: Upsert the fetched JSON into the `developer_metrics` table for the current user.
- [x] UI: Re-render the user's profile to display glowing Trust Score and a visual breakdown of their top languages.
