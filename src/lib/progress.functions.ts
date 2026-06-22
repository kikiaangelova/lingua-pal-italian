import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Server-defined XP values. Client cannot set XP amounts directly.
const XP_BY_ACTIVITY = {
  word_learned: 10,
  speak_practice: 5,
  write_practice: 5,
} as const;

// Cap per-event XP to prevent abuse (e.g. lesson score is 0-10, story 0-10).
const MAX_LESSON_SCORE = 10;
const MAX_STORY_SCORE = 10;
const DAILY_XP_CAP = 500;

const ActivitySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("word_learned"), deckId: z.string().min(1).max(64), wordIt: z.string().min(1).max(120) }),
  z.object({ type: z.literal("lesson_complete"), lessonId: z.string().min(1).max(64), score: z.number().int().min(0).max(MAX_LESSON_SCORE) }),
  z.object({ type: z.literal("story_complete"), storyId: z.string().min(1).max(64), score: z.number().int().min(0).max(MAX_STORY_SCORE) }),
  z.object({ type: z.literal("speak_practice") }),
  z.object({ type: z.literal("write_practice") }),
]);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const recordActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ActivitySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Compute server-controlled XP amount for this activity.
    let amount = 0;
    if (data.type === "lesson_complete") amount = data.score * 5;
    else if (data.type === "story_complete") amount = 10 + data.score * 5;
    else amount = XP_BY_ACTIVITY[data.type];

    // Side-effects per activity type (RLS still enforces ownership).
    if (data.type === "word_learned") {
      await supabase
        .from("learned_words")
        .upsert(
          { user_id: userId, deck_id: data.deckId, word_it: data.wordIt, correct_count: 1 },
          { onConflict: "user_id,word_it" },
        );
    } else if (data.type === "lesson_complete") {
      await supabase
        .from("lesson_completion")
        .upsert(
          { user_id: userId, lesson_id: data.lessonId, score: data.score },
          { onConflict: "user_id,lesson_id" },
        );
    } else if (data.type === "story_complete") {
      await supabase
        .from("story_progress")
        .upsert({ user_id: userId, story_id: data.storyId }, { onConflict: "user_id,story_id" });
    }

    // Award XP with server-side streak + daily cap logic.
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

    const priorDaily = cur?.daily_date === today ? (cur?.daily_xp ?? 0) : 0;
    const remaining = Math.max(0, DAILY_XP_CAP - priorDaily);
    const awarded = Math.min(amount, remaining);
    const dailyXp = priorDaily + awarded;
    const xp = (cur?.xp ?? 0) + awarded;

    await supabase.from("progress").upsert({
      user_id: userId,
      xp,
      streak,
      daily_xp: dailyXp,
      daily_date: today,
      last_active: today,
      updated_at: new Date().toISOString(),
    });

    return { xp, streak, dailyXp, awarded };
  });