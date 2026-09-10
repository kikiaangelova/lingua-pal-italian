import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_completed_lessons",
  title: "List completed lessons",
  description:
    "List grammar/vocab lessons the signed-in learner has completed, newest first, with scores.",
  inputSchema: {
    limit: z.number().int().optional().describe("How many lessons to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("lesson_completion")
      .select("lesson_id, score, completed_at")
      .eq("user_id", ctx.getUserId()!)
      .order("completed_at", { ascending: false })
      .limit(take);
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    const lessons = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(lessons) }],
      structuredContent: { lessons },
    };
  },
});
