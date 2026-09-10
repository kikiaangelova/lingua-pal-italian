import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_vocabulary",
  title: "List learned words",
  description:
    "List Italian words the signed-in learner has practised, with how many times each was correct.",
  inputSchema: {
    deck_id: z.string().optional().describe("Only return words from this deck."),
    limit: z.number().int().optional().describe("How many words to return (default 50, max 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ deck_id, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const take = Math.min(Math.max(limit ?? 50, 1), 200);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("learned_words")
      .select("word_it, deck_id, correct_count, created_at")
      .eq("user_id", ctx.getUserId()!);
    if (deck_id) query = query.eq("deck_id", deck_id);
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(take);
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    const words = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(words) }],
      structuredContent: { words },
    };
  },
});
