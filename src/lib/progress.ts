import { supabase } from "@/integrations/supabase/client";
import { recordActivity } from "./progress.functions";

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

export async function fetchProgress(userId: string) {
  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

// Client wrappers — XP amounts are determined server-side; callers cannot
// pass arbitrary values. RLS + the server function enforce ownership and caps.
export async function recordWordLearned(deckId: string, wordIt: string) {
  return recordActivity({ data: { type: "word_learned", deckId, wordIt } });
}

export async function recordLessonComplete(lessonId: string, score: number) {
  return recordActivity({ data: { type: "lesson_complete", lessonId, score } });
}

export async function recordStoryComplete(storyId: string, score: number) {
  return recordActivity({ data: { type: "story_complete", storyId, score } });
}

export async function recordSpeakPractice() {
  return recordActivity({ data: { type: "speak_practice" } });
}

export async function recordWritePractice() {
  return recordActivity({ data: { type: "write_practice" } });
}

export async function fetchLearnedWords(userId: string) {
  const { data } = await supabase
    .from("learned_words")
    .select("word_it, deck_id")
    .eq("user_id", userId);
  return data ?? [];
}

export async function fetchCompletedLessons(userId: string) {
  const { data } = await supabase
    .from("lesson_completion")
    .select("lesson_id, score")
    .eq("user_id", userId);
  return data ?? [];
}

export async function fetchCompletedStories(userId: string) {
  const { data } = await supabase
    .from("story_progress")
    .select("story_id")
    .eq("user_id", userId);
  return data ?? [];
}