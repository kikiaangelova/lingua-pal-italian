import { supabase } from "@/integrations/supabase/client";

export const LEVELS = [
  { name: "Principiante", min: 0 },
  { name: "Esploratore", min: 100 },
  { name: "Viaggiatore", min: 300 },
  { name: "Locale", min: 700 },
  { name: "Maestro", min: 1500 },
];

export function levelFor(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null!;
    }
  }
  const progressPct = next
    ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { current, next, progressPct };
}

export const DAILY_GOAL = 30;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchProgress(userId: string) {
  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function awardXp(userId: string, amount: number) {
  const { data: cur } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let streak = cur?.streak ?? 0;
  if (cur?.last_active === today) {
    // already counted today
  } else if (cur?.last_active === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  const dailyXp = cur?.daily_date === today ? (cur?.daily_xp ?? 0) + amount : amount;
  const xp = (cur?.xp ?? 0) + amount;

  await supabase
    .from("progress")
    .upsert({
      user_id: userId,
      xp,
      streak,
      daily_xp: dailyXp,
      daily_date: today,
      last_active: today,
      updated_at: new Date().toISOString(),
    });

  return { xp, streak, dailyXp };
}

export async function markWordLearned(userId: string, deckId: string, wordIt: string) {
  await supabase
    .from("learned_words")
    .upsert(
      { user_id: userId, deck_id: deckId, word_it: wordIt, correct_count: 1 },
      { onConflict: "user_id,word_it" },
    );
}

export async function fetchLearnedWords(userId: string) {
  const { data } = await supabase
    .from("learned_words")
    .select("word_it, deck_id")
    .eq("user_id", userId);
  return data ?? [];
}

export async function completeLesson(userId: string, lessonId: string, score: number) {
  await supabase
    .from("lesson_completion")
    .upsert(
      { user_id: userId, lesson_id: lessonId, score },
      { onConflict: "user_id,lesson_id" },
    );
}

export async function fetchCompletedLessons(userId: string) {
  const { data } = await supabase
    .from("lesson_completion")
    .select("lesson_id, score")
    .eq("user_id", userId);
  return data ?? [];
}

export async function completeStory(userId: string, storyId: string) {
  await supabase
    .from("story_progress")
    .upsert({ user_id: userId, story_id: storyId }, { onConflict: "user_id,story_id" });
}

export async function fetchCompletedStories(userId: string) {
  const { data } = await supabase
    .from("story_progress")
    .select("story_id")
    .eq("user_id", userId);
  return data ?? [];
}