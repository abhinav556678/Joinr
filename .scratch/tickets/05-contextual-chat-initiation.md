# 05 — Contextual Chat Initiation

**What to build:** When a user clicks the "Chat" button inside a recruitment post's modal, they should immediately be placed into a 1-on-1 chat thread with the recruiter. This specific chat session must be internally linked to the project they applied for so the context isn't lost.

**Blocked by:** 02-messages-tab, 04-feed-post-discovery

**Status:** ready-for-agent

- [x] Update the `matches` table schema to include a `project_id` reference.
- [x] Add a "Chat" button to the bottom of the recruitment post modal.
- [x] Clicking "Chat" creates a new match/thread (if one doesn't exist) between the applicant and the recruiter, linked to the specific `project_id`.
- [x] Immediately navigate the applicant to the newly created direct message screen.
