import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "record_mistake",
  title: "Record a mistake to review",
  description:
    "Save an Italian topic the learner got wrong so Luca revisits it in future sessions. Increments the count when the topic already exists.",
  inputSchema: {
    topic: z
      .string()
      .trim()
      .describe('Short lowercase-with-dashes slug, e.g. "passato-prossimo".'),
    note: z.string().trim().optional().describe("One-sentence note about the mistake."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ topic, note }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const slug = topic.toLowerCase().slice(0, 60);
    if (!slug)
      return { content: [{ type: "text", text: "topic is required" }], isError: true };
    const cleanNote = note?.slice(0, 240) ?? null;
    const userId = ctx.getUserId()!;
    const supabase = supabaseForUser(ctx);

    const { data: existing, error: readError } = await supabase
      .from("tutor_mistakes")
      .select("id, count")
      .eq("user_id", userId)
      .eq("topic", slug)
      .maybeSingle();
    if (readError)
      return { content: [{ type: "text", text: readError.message }], isError: true };

    if (existing) {
      const { error } = await supabase
        .from("tutor_mistakes")
        .update({
          count: (existing.count ?? 1) + 1,
          note: cleanNote ?? undefined,
          last_seen: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error)
        return { content: [{ type: "text", text: error.message }], isError: true };
      return {
        content: [{ type: "text", text: `Updated "${slug}" (now ${(existing.count ?? 1) + 1}×).` }],
        structuredContent: { topic: slug, count: (existing.count ?? 1) + 1 },
      };
    }

    const { error } = await supabase
      .from("tutor_mistakes")
      .insert({ user_id: userId, topic: slug, note: cleanNote });
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved "${slug}" to review.` }],
      structuredContent: { topic: slug, count: 1 },
    };
  },
});
