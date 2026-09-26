# Ticket 2: Routing Architecture
Label: `wayfinder:grilling`

## Question
How should we architect the navigation stack? We have a distinct Auth/Onboarding flow (Multi-step Wizard) and a Main flow (Home Feed, Chat, Profile). Should we use Expo Router (file-based navigation, Next.js style) or standard React Navigation (`@react-navigation/native-stack`) which gives us more explicit programmatic control over the Zustand state?

**Blocked by:** [Ticket 1: UI Component Strategy](ticket-1-ui-strategy.md)
