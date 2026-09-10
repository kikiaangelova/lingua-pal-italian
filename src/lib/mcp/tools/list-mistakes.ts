import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_mistakes",
  title: "List recurring mistakes",
  description:
    "List the Italian topics the learner keeps getting wrong, with how often and a short note.",
  inputSchema: {
    limit: z.number().int().optional().describe("How many topics to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("tutor_mistakes")
      .select("topic, note, count, last_seen")
      .eq("user_id", ctx.getUserId()!)
      .order("last_seen", { ascending: false })
      .limit(take);
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    const mistakes = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(mistakes) }],
      structuredContent: { mistakes },
    };
  },
});
