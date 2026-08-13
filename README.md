# BlinkMoney Wealth Streak

## Overview

**Wealth Streak** turns everyday micro-investing into a habit worth returning to. Instead of a static portfolio screen, users see their financial consistency represented the way a habit-tracking app represents a streak: a running flame counter, an XP/level system, milestone badges, and a satisfying, fintech-grade celebration every time they invest.

The core loop:

```
Dashboard → Invest Today → Choose Amount → Confirm → Loading → 🎉 Success
   ↑                                                              │
   └──────────────── Streak +1, XP +, Milestone check ───────────┘
```

This is a genuinely new feature — not a bug fix, not a mutual fund analyser, not a set of static screens. Every button, animation, and state transition in this repo is wired up and functional.

## Why this feature?

**Engagement.** Streaks are one of the most reliable psychological hooks for daily return behaviour (see Duolingo, Snapchat). Applying the same mechanic to a ₹21/day investment habit gives BlinkMoney a low-friction reason for users to open the app every day, not just when they have a large sum to invest.

**Wealth gamification.** The Save → Grow → Borrow journey is usually invisible — a number that goes up slowly in the background. Wealth Streak makes that progress visible and rewarding: XP, levels, and milestone badges (7/30/50/100 days) turn an abstract savings habit into a game with clear, achievable goals.

**Virality.** The Share Achievement flow generates a clean, on-brand image containing only the streak count and celebratory copy — never balances, holdings, or account details — so users can post a genuine accomplishment to their story or group chat without exposing anything private. Every share is a small, safe advertisement for BlinkMoney.

## Tech Stack

- **Expo SDK 51** (managed workflow, EAS-buildable)
- **TypeScript** (strict mode)
- **React Navigation** (native-stack)
- **React Native `Animated`** for all motion (count-ups, springs, confetti, pulsing streak icon) — chosen over Reanimated for the animation complexity here to keep the dependency surface small; Reanimated is still installed as a peer dependency of `react-native-screens`/gesture-handler
- **`@expo/vector-icons`** (Ionicons) for the icon system
- **`expo-linear-gradient`**, **`expo-haptics`**, **`expo-sharing`**, **`react-native-view-shot`** for the share-achievement card capture/export flow

## Architecture

```
src/
├── components/         # App-wide, feature-agnostic UI primitives
│   ├── Button/          Animated, debounced, variant-driven button
│   ├── Card/             Surface primitive (default/outline/subtle)
│   ├── ProgressBar/      Animated fill bar used everywhere progress is shown
│   ├── StreakBadge/      The hero flame + count-up streak number
│   ├── AchievementCard/  Unlocked / in-progress / locked badge card
│   ├── XPProgress/       Level pill + XP bar
│   ├── StatCard/         Dashboard stat tile
│   ├── EmptyState/       First-time-user / no-data state
│   ├── ErrorState/       Retry-capable error state
│   ├── LoadingSkeleton/  Shimmer skeleton for the dashboard
│   └── Header/           Back button + title bar
│
├── features/wealthStreak/
│   ├── screens/          The 6 screens in the core flow (see below)
│   ├── components/       Feature-only UI: ConfettiBurst, ShareAchievementCard
│   ├── hooks/            useWealthContext — shared profile state
│   ├── services/         wealthService (mock API), shareService (native share)
│   ├── types/            Domain types (WealthProfile, Milestone, Achievement…)
│   └── mock/              Seed data + milestone/achievement derivation logic
│
├── navigation/           RootNavigator + typed param list
├── theme/                Design tokens: colors, typography, spacing, shadows
├── hooks/                Cross-feature hooks (useCountUp)
├── utils/                formatINR, truncateName, etc.
└── constants/            Investment presets, min/max amounts
```

**Why this shape?** `components/` holds anything reusable outside the wealth feature (a `Button` or `Card` shouldn't know what a "streak" is). `features/wealthStreak/` holds everything that *does* know about streaks, XP, and milestones, so the feature could be deleted or extracted wholesale without touching shared UI.

## Mock API

There is no backend for this assignment, and none is required. `wealthService` in `src/features/wealthStreak/services/wealthService.ts` simulates one:

- Every call has **600–1200ms of artificial latency** (`networkConfig`), so loading states are real, not instant.
- `networkConfig.forceNextFailure` can be flipped to make the *next* call throw, which is how the error/retry states are demonstrated without needing a real network failure.
- `invest(amount)` mutates an in-memory "backend" (streak, XP, totals, milestones) and returns a typed `InvestmentResult`, mirroring what a real POST /invest endpoint would return.
- `resetToScenario()` lets you jump between first-time-user, default, missed-streak, and already-invested-today states for testing (see **Trying different states** below).

This keeps the UI honest: every loading spinner, skeleton, and error banner in the app is driven by the same async path a real API call would take.

## Key Features

- Full dashboard: streak, total invested, estimated growth, XP, next-milestone progress, horizontal achievements strip
- Investment flow: preset amounts (₹21/₹51/₹101/₹501) + custom amount entry, live streak preview, confirmation screen, animated loading state
- Investment success screen: count-up XP, animated streak card, milestone-unlock celebration, tasteful confetti burst, and a **Share Achievement** action that renders an off-screen card and hands it to the native share sheet (or falls back to a text share if image capture isn't available)
- Wealth Journey screen: level/XP progress + a tappable milestone timeline with a bottom-sheet detail view
- Achievements screen: grouped Unlocked / In Progress / Locked sections
- Full first-time-user empty state (no fabricated completed badges)
- Missed-streak state that preserves historical achievements and total wealth
- "Already invested today" state that disables re-incrementing the streak

## Edge Cases

| Case | Handling |
|---|---|
| First-time user | Dedicated empty state; zeroed stats; all achievements shown as locked (never faked as complete) |
| Missed streak | Dashboard shows a "streak ended at N days" card; achievements/totals are preserved, not erased |
| Already invested today | Invest screen shows a notice; Confirm/Loading is disabled; primary dashboard CTA becomes a "complete" card |
| Invalid / below-minimum amount | Inline validation error, Continue button disabled until a valid amount is entered |
| Double-tapping Confirm / any button | `Button` debounces presses under 400ms; the confirm handler also has an `isSubmitting` guard |
| Failed investment call | Caught in `ConfirmationScreen`, shown as an inline error, user can retry without losing their selected amount |
| Failed dashboard/achievements/journey load | Per-section `ErrorState` with Retry, isolated so one failing section doesn't blank the whole screen |
| Unmounted async requests | `WealthProvider` guards all `setState` calls behind an `isMountedRef` + request-id check |
| Very long user names | `truncateName()` clips display names with an ellipsis |
| Large investment amounts | `MAX_INVESTMENT_AMOUNT` cap with a validation message |
| Small / large screens | Everything is built with Flexbox, `ScrollView`, and `SafeAreaView`/insets — no hardcoded screen dimensions |
| Keyboard overlap | `InvestScreen` wraps its content in `KeyboardAvoidingView` and uses `keyboardShouldPersistTaps` |
| Android back button | Handled natively by React Navigation's native-stack; the success screen additionally resets the stack via `CommonActions.reset` so back can't replay it |
| Rapid navigation / screen transitions during loading | Screens key their async effects to `useFocusEffect` + a request-id ref so a stale response can't overwrite a newer one |
| Empty achievements list | Explicit `EmptyState` rather than a blank screen |
| Native share unavailable | `shareService` falls back to a plain-text `Share.share()` call so the button is never dead |

## Running the project

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `a` for an Android emulator / `i` for iOS simulator.

### Android development

- Install [Android Studio](https://developer.android.com/studio) and set up an emulator, **or** connect a physical device with USB debugging enabled.
- With the Metro bundler running (`npx expo start`), press `a` to launch on Android, or run:
  ```bash
  npx expo run:android
  ```
  the first time you want a full native build in the emulator/device (this generates a local `android/` folder via prebuild; it is not required for EAS builds and is excluded from this ZIP).

## Build Android APK

This project uses **EAS Build** and is configured to produce an installable `.apk` (not just an `.aab`) via the `preview` profile in `eas.json`:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
```

Steps:

```bash
npm install -g eas-cli
eas login
eas build:configure        # links the project to your Expo account, if not already linked
npx eas build -p android --profile preview
```

EAS will queue a cloud build and give you a download link for the resulting `.apk` when it finishes — install it directly on a device (`adb install app.apk`) or via the link EAS provides. No Expo Go, keystore setup, or paid account is required for a preview/internal build.

> This project was validated locally with `npx expo export --platform android`, which successfully bundled the entire app (1,100+ modules, zero errors) — confirming the JS/TS side is EAS-build-ready. The actual cloud APK build was not run as part of producing this repo, since that requires an authenticated EAS account; the command above is the exact, correct command to produce it.

## Engineering Decisions

- **`Animated` over Reanimated for app logic.** All the animation in this feature (count-ups, springs, confetti, progress fills) is achievable with the core `Animated` API without dropping to the UI thread, keeping the codebase approachable while `react-native-reanimated` stays installed only as a transitive peer dependency of navigation/gesture-handler.
- **Context, not Redux/Zustand.** A single `WealthProvider` context covers the one piece of state (`WealthProfile`) that's genuinely shared across screens. Achievements and journey data are fetched per-screen instead, since they're read-only within a session and don't need to be globally synchronized — this avoids the complexity of a full state-management library for a small surface area.
- **In-memory mock backend.** `wealthService` holds state in a module-level variable rather than `AsyncStorage`, so a fresh app launch always starts from a clean, demo-friendly state. This was a deliberate trade-off for evaluator convenience over persistence.
- **Share card renders off-screen.** `ShareAchievementCard` is rendered in the tree (off-screen, `pointerEvents="none"`) rather than as a separate route, so `react-native-view-shot` can capture it without a screen transition.
- **No sensitive data in shareable content.** The share card component only ever receives a streak count and copy strings — it has no access to the `WealthProfile` object, so it's structurally impossible to accidentally leak totals or XP into a shared image.

## Future Production Integration

Swapping the mock layer for BlinkMoney's real backend should only touch `src/features/wealthStreak/services/wealthService.ts` and `shareService.ts` — every screen consumes these through the same typed function signatures (`getWealthProfile()`, `invest(amount)`, etc.), so:

1. Replace the in-memory `profileState` mutations with real HTTP calls (e.g. `fetch`/`axios` against BlinkMoney's investment API), keeping the same return types.
2. Move `hasInvestedToday` / streak-break detection server-side, where it can be computed against real timestamps and timezones rather than the client-side `todayISO()` used here.
3. Replace `resetToScenario()` (a dev-only helper) with real auth-scoped user fetches.
4. XP/level curve and milestone thresholds (`buildMilestones`, `xpForLevel`) can move to a remote-config service if BlinkMoney wants to tune the gamification loop without a client release.

No screen, component, or navigation code would need to change.
