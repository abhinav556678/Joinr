# 06 — Project Formation & Collaboration Feed

**What to build:** Inside an active chat, a user clicks "Propose Team". When accepted, a new "Project" is created. The app broadcasts a "🚀 User A and B are building [Project]" announcement to a Community Feed tab, and their profiles update with a "Current Project" badge.

**Blocked by:** 05 — Real-Time Chat Integration

**Status:** ready-for-agent

- [x] UI: Add a "Propose Team" button to the Chat Header.
- [x] DB: Clicking it inserts a row into the `projects` and `project_members` tables.
- [x] UI: Build a "Community Feed" tab in the app's bottom navigation.
- [x] UI/DB: Fetch all formed `projects` and display them as global announcements on the Community Feed.
