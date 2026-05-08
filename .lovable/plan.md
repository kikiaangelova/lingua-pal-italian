## Navigation redesign — Italian app

Goal: no dead-ends, profile is easy to leave, persistent thumb-friendly bottom nav, clear "Continue learning" path.

### 1. BottomNav (`src/components/italian/BottomNav.tsx`)
Rebuild to match the requested 6 tabs and tighter mobile UX:
- Tabs (in order): **Home, Vocab, Speak, Grammar, Read (Stories), Profile**.
- Move **Luca (tutor)** off the bottom bar — promote on Home hero instead (already linked there). This keeps 6 tabs as requested.
- Full-width fixed bar (`fixed bottom-0 inset-x-0`) with safe-area padding (`pb-[env(safe-area-inset-bottom)]`), not a floating pill — bigger tap targets (min 48px height), spreads across full width on mobile.
- Active tab: filled pill + colored icon + label, with a small top accent bar for clarity. Inactive: muted icon + label.
- Smooth `transition` and subtle scale on press.
- Keep glassy backdrop, but remove the floating animation that makes it harder to tap.

### 2. Profile page (`src/routes/profile.tsx`)
Add a top utility bar so users can always escape:
- **Back** button (uses `router.history.back()` with safe fallback to `/`).
- **Home** button (Link to `/`).
- Title in the middle, **Sign out** moved into the top bar as a clear icon-button as well as the existing bottom one.
- Add a small breadcrumb: `Home › Profile`.
- Keep tap targets ≥44px.

### 3. Shared `PageHeader` component (new: `src/components/italian/PageHeader.tsx`)
Reusable Back + Home + breadcrumb header. Add it to:
- `profile.tsx`
- `learn.tsx`, `learn.$deckId.tsx`
- `grammar.tsx`, `grammar.$lessonId.tsx`
- `read.tsx`, `read.$storyId.tsx`
- `speak.tsx`
- `tutor.tsx`
This guarantees no trapped screens.

### 4. Home dashboard (`src/routes/index.tsx`)
- Add a **"Continue learning"** primary CTA card near the top (below hero) that resumes the user's last activity. MVP: read `last_route` from `localStorage` (set by a small effect in each section route). Falls back to `/learn` if none.
- Reorder visual hierarchy: Hero → Continue Learning → Daily goal → Pillars → Word of the day → Profile mini-card moved lower (secondary).
- Pillars grid updated to 5 tiles to mirror nav (Vocab, Speak, Grammar, Read, Luca).

### 5. Last-activity tracking (`src/lib/last-activity.ts`, new)
Tiny helper:
- `setLastActivity({ to, label })` → localStorage
- `getLastActivity()` → `{ to, label } | null`
Called from a `useEffect` in each section route.

### 6. AppShell (`src/routes/__root.tsx`)
- Adjust `pb-32` → `pb-24` and ensure content isn't hidden behind the new full-width bar. Add safe-area padding.

### Out of scope (not changing now)
- Onboarding flow content (already exists at `/onboarding`).
- Auth screens.
- Any backend/schema changes — `last_route` is client-only for now.
