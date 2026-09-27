# 07 — Skill Match Score Implementation

**What to build:** A contextual score that shows recruiters how well an applicant matches a project's required skills. This score is only calculated and displayed when a recruiter views an applicant's profile *from inside a chat thread tied to a specific project*.

**Blocked by:** 03-post-creation, 05-contextual-chat-initiation, 06-user-profile-github-graph

**Status:** ready-for-agent

- [x] Add a `skills` array column to the `users` table.
- [x] Modify the Profile screen so that if it is opened in the context of a specific chat thread/project, it calculates the percentage of overlapping skills.
- [x] Display this Match Score (e.g., "75% Match") prominently on the Profile screen, but **only** if the viewer is the recruiter and they are looking at an applicant.
- [x] Clean up/remove any remaining logic for the deprecated GitHub-based Trust Score.
