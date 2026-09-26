# 01 — Auth & Onboarding Foundation

**What to build:** A user can open the app, sign up via Email/Password, fill out their manual profile (name, bio, role), and land on an empty Home screen. The app securely persists their login state using Zustand and saves their profile to the `users` table in Supabase.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] UI: Build Login/Signup screens with a sleek dark-mode aesthetic.
- [x] State: Configure Zustand store to persist the Supabase session token.
- [x] DB: Successfully insert a new row into the `users` table upon signup with their manual bio.
- [x] Navigation: Automatically redirect authenticated users away from the Auth screens to the Main App screens.
