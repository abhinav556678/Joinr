# Ticket 3: Auth & State Wire-up
Label: `wayfinder:grilling`, `wayfinder:task`

## Question
How will we wire Supabase Auth into our Zustand store? We need a secure, reliable way to listen to Supabase's `onAuthStateChange` event, persist the user's session securely on the device, and inject that state into our Router to automatically protect the Main screens from unauthenticated users.

**Blocked by:** [Ticket 2: Routing Architecture](ticket-2-routing-architecture.md)
