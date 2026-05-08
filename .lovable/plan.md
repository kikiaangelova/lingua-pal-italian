
# Ciao — Your Italian Learning Journey

A playful, gamified Italian app for complete beginners that grows with you across four pillars: **vocabulary, speaking, grammar, and reading**. Progress is saved to your account so you can pick up wherever you left off.

---

## What you'll get

### 1. Account & progress (Lovable Cloud)
- Sign up / log in with **email + password** and **Google**
- Your account remembers: streak, XP, level, learned words, lessons completed, reading progress
- A simple **profile** page (name, avatar, level)

### 2. Home dashboard (gamified)
- **Streak counter** (🔥 days in a row)
- **XP bar + level** ("Principiante → Esploratore → Viaggiatore → Locale")
- **Daily goal** ring (e.g. earn 30 XP today)
- **Frase del giorno** (phrase of the day, with audio)
- Quick-launch tiles for the four pillars

### 3. Daily Vocabulary 📚
- Themed decks for beginners: Saluti, Al Bar, Numeri, Famiglia, Casa, Tempo, Cibo, Viaggio
- **Flashcards** with flip + native audio (already built — we'll polish)
- **Quiz mode**: multiple choice, type-the-word, listen-and-pick
- Spaced-repetition lite: words you miss come back sooner
- **+10 XP** per correct answer, badges at milestones (10, 50, 100 words)

### 4. Daily Speaking 🎙️
- Listen to a phrase, then **record yourself** and replay side-by-side
- Pronunciation tips (stressed syllable highlighted)
- "Speak the answer" challenges (browser speech recognition where supported)
- Daily 3-phrase speaking warm-up

### 5. Grammar, step by step 📖
- Bite-sized lessons in order, unlocked one at a time:
  1. The alphabet & sounds
  2. Articles (il, la, lo, i, le, gli)
  3. Nouns & gender
  4. Essere & Avere (to be / to have)
  5. Present tense — regular -are verbs
  6. Asking questions
  7. Numbers, time, dates
  8. Common prepositions
- Each lesson = short explanation + examples + 5-question check → earns XP

### 6. Step-by-step Reading 📜
- Mini-stories at A0 → A1 level (3–6 sentences, growing longer)
- Tap any word to see translation + hear it
- "Comprehension" check at the end (2–3 questions)
- Stories themed around Italy: una mattina a Roma, al mercato, in spiaggia…

### 7. Coach corner (optional bonus)
- A small "Buongiorno!" daily encouragement message based on your streak
- Gentle nudge if you miss a day

---

## Visual & feel
- Keep the warm Italian palette (terracotta + cream) **and** add gamified touches: bright accent for XP/streak, soft confetti on level-up, springy framer-motion animations on cards and buttons.
- Big, friendly typography (Fraunces display + Inter body, already set).
- Mobile-first — works great on phone for daily practice.

---

## Suggested build order (so you can use it fast)

1. **Foundations**: enable Lovable Cloud, set up auth (email + Google), profile, XP/streak tracking, app shell with bottom nav (Home · Learn · Speak · Read · Profile).
2. **Vocabulary v2**: keep current flashcards, add quiz mode + XP + saved progress.
3. **Speaking module**: record-yourself + listen-back, daily warm-up.
4. **Grammar lessons**: first 4 lessons with checks.
5. **Reading module**: 5 starter stories with tap-to-translate.
6. **Polish**: badges, level-up animation, daily reminder message.

---

## Technical notes (for the curious)

- **Backend**: Lovable Cloud (Postgres + auth). Tables: `profiles`, `progress` (xp, streak, level, last_active), `learned_words`, `lesson_completion`, `story_progress`.
- **Audio**: browser `SpeechSynthesis` (it-IT) for TTS; `MediaRecorder` for user recordings (kept locally, not uploaded).
- **Speech recognition**: Web Speech API where supported; graceful fallback otherwise.
- **Framework**: TanStack Start routes — `/`, `/login`, `/learn`, `/learn/$deckId`, `/speak`, `/grammar`, `/grammar/$lessonId`, `/read`, `/read/$storyId`, `/profile`.
- All lesson and story content authored in TypeScript files (no CMS) so it's easy to expand.

---

## Quick check before building

- **Login methods**: I'll set up **email + password** and **Google sign-in**. Tell me if you'd rather skip Google.
- **Profile data**: just name + avatar (so we have a "Ciao, [your name]!" greeting). OK?
- **Scope of v1**: I'll ship pillars 1–4 strong (foundation, vocab, speaking, grammar) and seed the reading module with 5 stories. We can grow content together after.

Ready to build when you are — just hit **Implement plan**. 🇮🇹
