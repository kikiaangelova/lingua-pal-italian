## Goal
Make the web experience feel complete for language learning by removing broken Italian voice messaging, making audio work gracefully without exposing technical failures, and adding the missing writing mode so learners can listen, speak, read, and write.

## What I’ll implement

### 1. Fix the voice UX root cause
- Remove all user-facing text like “No Italian voice is available on this device yet” and “No Italian system voice detected”.
- Keep server-side Italian audio as the primary path.
- Treat browser speech synthesis as a silent fallback only.
- If neural audio is unavailable, show a calm generic retry message instead of device-setup instructions.

### 2. Rework the audio controls
- Replace the current `VoicePicker` behavior with a simple Italian audio panel.
- Remove the dependency on local Italian voice detection for the UI.
- Keep a test/replay action and clear loading state.
- Make the speaking page always feel usable, not blocked by browser capability checks.

### 3. Fix speaking page messaging
- Update the audio coach states so they never blame the user’s device.
- Change the default status from technical setup language to learning-focused guidance.
- Keep record/playback, but make playback failures surface as friendly retry feedback.

### 4. Add the missing writing mode
- Create a dedicated writing practice route.
- Add short guided prompts based on Italian phrases or mini-scenarios.
- Include self-check feedback structure so the experience supports the full loop: listen, speak, read, write.
- Add navigation/CTA entry points from the home experience.

### 5. Tighten landing messaging
- Rewrite the hero copy so it sounds premium, calm, and intentional instead of chaotic.
- Keep Gen Z energy, but make it emotionally consistent with a serious learning product.
- Align the homepage promise with the actual product loop.

## Files likely affected
- `src/lib/speak.ts`
- `src/components/italian/VoicePicker.tsx`
- `src/routes/speak.tsx`
- `src/routes/index.tsx`
- `src/components/italian/BottomNav.tsx`
- new writing route under `src/routes/`

## Technical notes
- I will not rely on browser-installed Italian voices for core UX.
- The app will prefer `/api/tts` and only fall back silently when needed.
- The new writing route will follow existing route conventions and reuse the current design system.
- I’ll keep the fix frontend-focused unless backend changes are truly required.

## Expected outcome
After this pass, users should no longer see broken Italian voice warnings, the speaking experience should feel intentional instead of fragile, and the app will finally support the core learning loop across listening, speaking, reading, and writing.