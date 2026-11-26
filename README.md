# BridgeRN — NCLEX-RN Prep for Internationally Educated Nurses

BridgeRN is an exam-faithful, low-bandwidth-first NCLEX-RN preparation app built for internationally educated nurses (IENs), starting with nurses educated in the Philippines and India (including many working across the Gulf).

> **Medical-Education Disclaimer:** BridgeRN is strictly an NCLEX-RN exam-preparation resource. It does not provide clinical advice, diagnosis, or medical treatment, and readiness estimates include a confidence range and never guarantee exam passage.

## Current Phase: Phase 1 (Foundation)

- Expo managed workflow (TypeScript + Expo Router)
- Calm Light/Dark clinical theme with accessible scaling & screen-reader labels
- Supabase authentication (Email/Password + Google OAuth) with `expo-secure-store` chunked token persistence
- IEN Onboarding profile (`country_of_education`, `current_country`, `target_state`, `exam_date`, `weekly_study_hours`, consent & disclaimer acknowledgment)
- Self-service account deletion RPC (`delete_own_account`)
- Full PostgreSQL schema & Row-Level Security (RLS) migrations in `supabase/migrations/`

## Prerequisites

- Node.js 20+ and npm
- Expo CLI (`npx expo`)
- A [Supabase](https://supabase.com) project (or local Supabase CLI)
- Android Studio / emulator or Expo Go (Android-first, iOS-compatible)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `EXPO_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon/public key
   - `EXPO_PUBLIC_APP_SCHEME` — Deep link scheme (default `bridgern`)
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Optional Google OAuth client ID (configured in Supabase Auth -> Providers -> Google)
   - `EXPO_PUBLIC_POSTHOG_API_KEY` / `EXPO_PUBLIC_REVENUECAT_*` — Configured in later phases

3. **Apply Supabase database migrations**
   Using Supabase CLI or the Supabase SQL Editor, run in order:
   1. `supabase/migrations/0001_initial_schema.sql`
   2. `supabase/migrations/0002_rls_policies.sql`

   For Google Sign-In in Supabase Auth, add `bridgern://auth/callback` (and your Expo Go dev URL if testing via Expo Go) to **Authentication -> URL Configuration -> Redirect URLs**.

## Running the App

```bash
# Start Metro bundler
npm start

# Launch on Android emulator / connected device
npm run android

# Launch on iOS simulator (macOS)
npm run ios
```

## Testing & Verification

```bash
# TypeScript type-check
npm run typecheck

# Run unit tests
npm test
```

## Adding Questions (Preview of Phase 2 & 7)

Questions live in `public.questions` and `public.question_options`. All published items must have a non-null `reviewer_id` (enforced by a database CHECK constraint) and must be 100% original content—never reproduce copyrighted or real NCLEX exam items. Phase 2 adds the 40-question original placeholder seed script, and Phase 7 adds bulk CSV/JSON import with schema validation.
