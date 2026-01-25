# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Moody is a cross-platform drinking game app built with React Native and Expo. Players progress through challenges, mini-games, and random events across different game modes (soft/hard/caliente).

## Commands

```bash
npm start           # Start Expo dev server
npm run android     # Build and run on Android
npm run ios         # Build and run on iOS
npm run web         # Run web version
npm run lint        # Run ESLint
```

## Architecture

### Tech Stack
- **Framework:** React Native 0.79.5 / Expo SDK 53
- **Routing:** Expo Router (file-based in `app/`)
- **Backend/Auth:** Supabase
- **Monetization:** RevenueCat SDK
- **State:** React Context (AuthContext, PurchaseContext)
- **Storage:** AsyncStorage (game state), SecureStore (auth tokens)
- **i18n:** i18next with EN/FR support

### Key Directories

- `app/` - Expo Router pages and layouts
  - `app/game/[id]/play.tsx` - Main game loop screen
  - `app/data/dataen.json`, `datafr.json` - Challenge content (not in Supabase)
  - `app/auth/` - Authentication screens
- `src/engine/` - Core game logic (GameEngine, StateManager, ContentManager, etc.)
- `components/` - Reusable UI components
  - `cards/` - Challenge card variants
  - `minigames/` - Mini-game UI (Roulette, Explosion, FlashQuiz, etc.)
- `hooks/` - React hooks (`useGameEngine`, `useGameContent`, `usePurchases`, etc.)
- `context/` - Auth and Purchase providers
- `lib/` - Utilities (supabase client, storage helpers, i18n setup)
- `services/` - Business logic (purchases, affiliates, payouts)
- `config/offerings.ts` - RevenueCat product IDs and entitlements

### Game Flow

1. `app/index.tsx` - Player list management
2. `app/menu.tsx` - Mode selection
3. `app/game/[id]/play.tsx` - Game loop using `useGameEngine` hook
4. Challenges loaded from JSON files via `useLocalizedData`

### Key Types (src/engine/types.ts)

- `GameMode`: 'soft' | 'hard' | 'caliente'
- `GameState`: players, currentRound, config, roundHistory
- `Challenge`: type (dare/truth/drink/action), content, mode, difficulty
- `Player`: score, drinks, penalties, jokers

### Monetization

Entitlements defined in `config/offerings.ts`:
- `premium` - Full access
- `mini_games_pack` - Mini-games unlock
- `caliente_mode` - Spicy mode unlock

## Environment Setup

Copy `.env.example` and configure:
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_KEY`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`

## Patterns

- Challenge content is loaded from static JSON files (`app/data/`), not queried from Supabase
- Game state persists via AsyncStorage helpers in `lib/storage.ts`
- Auth tokens stored securely via custom SecureStore adapter in `lib/supabase.ts`
- Heat/difficulty system scales from 1-5 based on round progression
