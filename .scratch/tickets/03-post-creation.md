# 03 — Recruitment Post Creation

**What to build:** Recruiters need a way to create recruitment posts. A floating "+" button on the main "Look to Join" feed will open a form. Submitting this form saves the post data, including the new required skills and position title, into the database.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [x] Add `skills_required` (text array) and `recruiting_for` (text) columns to the `projects` table in Supabase.
- [x] Add a Floating Action Button (FAB) on the main feed screen.
- [x] Build a modal or screen containing the creation form (Topic, Position, Skills Required, Description).
- [x] Wire the form to insert a new row into the `projects` table on submission.
