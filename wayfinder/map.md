# Joinr Wayfinder Map
Label: `wayfinder:map`

## Destination
A complete, clean-architecture V1 (MVP) of Joinr: A React Native app matching developers using Supabase Realtime, Zustand state management, and a Python FastAPI AI matchmaking service.

## Notes
- **Domain**: Mobile App Development, Matchmaking, AI integration.
- **Tech Stack**: React Native (Expo), Zustand, Supabase, Python (FastAPI).
- **Core Reference**: Always adhere to the architecture and UX flows defined in `master.md`.
- **Tracker**: Local-markdown tracker (files located in the `wayfinder/` directory).

## Decisions so far
*(No decisions recorded yet. Route is currently being charted.)*

## Open Tickets (The Frontier)
- [Ticket 1: UI Component Strategy](ticket-1-ui-strategy.md) — Unblocked
- [Ticket 2: Routing Architecture](ticket-2-routing-architecture.md) — Blocked by Ticket 1
- [Ticket 3: Auth & State Wire-up](ticket-3-auth-state.md) — Blocked by Ticket 2

## Not yet specified
- **AI Matchmaking Logic:** The exact LLM prompt engineering and API request formatting for the FastAPI service to calculate the compatibility score.
- **External APIs:** How we will parse and format the JSON payloads from the GitHub and LeetCode REST APIs.
- **Feed UI:** The exact animation and interaction logic for the vertical scrolling feed and the "Connect" messaging button.
- **Push Notifications:** Setup and wiring of Firebase Cloud Messaging (FCM) through Supabase/Vercel.

## Out of scope
- Tracking every GitHub push/commit from a user (Redefined as out-of-scope during initial grilling; replaced by manual "Collaboration Announcements").
