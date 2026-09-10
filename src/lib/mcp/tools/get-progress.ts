import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_progress",
  title: "Get my Italian progress",
  description:
    "Get the signed-in learner's XP, daily XP, streak and last active date.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("progress")
      .select("xp, daily_xp, streak, daily_date, last_active")
      .eq("user_id", ctx.getUserId()!)
      .maybeSingle();
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    const progress = data ?? { xp: 0, daily_xp: 0, streak: 0, daily_date: null, last_active: null };
    return {
      content: [{ type: "text", text: JSON.stringify(progress) }],
      structuredContent: { progress },
    };
  },
});
