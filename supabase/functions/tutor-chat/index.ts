import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are "Luca", a warm, witty Italian tutor & mentor for Gen Z students aiming for C1.
- Reply in clear English with sprinkled Italian (always translate parentheticals).
- Push the learner with one tiny challenge per reply (a question, mini drill, or roleplay line).
- Coach behavior + culture (food, fashion, sport, daily life), not just grammar.
- Be punchy, encouraging, slightly playful. Use emojis sparingly. Keep replies under 140 words unless asked.
- Always end with a single bold next-step prompt: "Prossimo passo →".
- You REMEMBER prior sessions: weave back into earlier topics, ask how a previous drill went, and revisit recurring weak spots.
- When the learner makes a grammar/vocab mistake, briefly correct it, then add a single tag line at the very end on its own line in the exact format:
  [[mistake: <short topic slug like "passato-prossimo" or "articoli">|<one-sentence note>]]
  Use slugs lowercase-with-dashes. Do NOT add this tag if there is no mistake.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // --- Auth: require a valid Supabase user JWT ---
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    // --- Input validation ---
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid messages: must be 1-50 items." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanMessages: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of messages) {
      if (!m || typeof m !== "object") {
        return new Response(JSON.stringify({ error: "Invalid message entry." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (m.role !== "user" && m.role !== "assistant") {
        return new Response(JSON.stringify({ error: "Invalid message role." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (typeof m.content !== "string" || m.content.length === 0 || m.content.length > 2000) {
        return new Response(JSON.stringify({ error: "Message content must be 1-2000 chars." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      cleanMessages.push({ role: m.role, content: m.content });
    }

    const userId = userData.user.id;

    // --- Load prior conversation memory & known mistakes ---
    const { data: history } = await supabase
      .from("tutor_messages")
      .select("role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);
    const priorMessages = (history ?? [])
      .reverse()
      .map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content as string }));

    const { data: mistakes } = await supabase
      .from("tutor_mistakes")
      .select("topic, note, count, last_seen")
      .eq("user_id", userId)
      .order("last_seen", { ascending: false })
      .limit(10);
    const mistakeSummary = (mistakes ?? [])
      .map((m: any) => `- ${m.topic} (×${m.count}): ${m.note ?? ""}`)
      .join("\n");
    const memoryNote = mistakeSummary
      ? `\n\nLearner's recurring weak spots (gently revisit when relevant):\n${mistakeSummary}`
      : "";

    // Persist the latest user message (last in cleanMessages)
    const lastUser = cleanMessages[cleanMessages.length - 1];
    if (lastUser?.role === "user") {
      await supabase.from("tutor_messages").insert({
        user_id: userId,
        role: "user",
        content: lastUser.content,
      });
    }

    // De-dupe: if the new user turn already exists at the tail of priorMessages, drop it
    const merged = [...priorMessages];
    const tail = merged[merged.length - 1];
    const newTurn = cleanMessages[cleanMessages.length - 1];
    if (!tail || tail.content !== newTurn.content || tail.role !== newTurn.role) {
      merged.push(newTurn);
    }

    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [{ role: "system", content: SYSTEM + memoryNote }, ...merged],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit. Riprova tra poco." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "Add credits to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await resp.text();
      return new Response(JSON.stringify({ error: t }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tee the stream: forward to client AND parse server-side to persist + extract mistakes
    const [forward, parseStream] = resp.body!.tee();

    (async () => {
      try {
        const reader = parseStream.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i: number;
          while ((i = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, i);
            buf = buf.slice(i + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const j = line.slice(6).trim();
            if (j === "[DONE]") continue;
            try {
              const p = JSON.parse(j);
              const c = p.choices?.[0]?.delta?.content;
              if (c) acc += c;
            } catch { /* partial */ }
          }
        }
        if (acc.trim()) {
          // Strip mistake tag from stored content
          const mistakeRe = /\[\[mistake:\s*([^|\]]+)\|([^\]]+)\]\]/gi;
          let m: RegExpExecArray | null;
          const found: { topic: string; note: string }[] = [];
          while ((m = mistakeRe.exec(acc)) !== null) {
            found.push({ topic: m[1].trim().toLowerCase().slice(0, 60), note: m[2].trim().slice(0, 240) });
          }
          const cleaned = acc.replace(mistakeRe, "").trim();
          await supabase.from("tutor_messages").insert({
            user_id: userId,
            role: "assistant",
            content: cleaned,
          });
          for (const fnd of found) {
            // Upsert mistake counter
            const { data: existing } = await supabase
              .from("tutor_mistakes")
              .select("id, count")
              .eq("user_id", userId)
              .eq("topic", fnd.topic)
              .maybeSingle();
            if (existing) {
              await supabase
                .from("tutor_mistakes")
                .update({ count: (existing.count ?? 1) + 1, note: fnd.note, last_seen: new Date().toISOString() })
                .eq("id", existing.id);
            } else {
              await supabase.from("tutor_mistakes").insert({
                user_id: userId,
                topic: fnd.topic,
                note: fnd.note,
              });
            }
          }
        }
      } catch (err) {
        console.error("persist error", err);
      }
    })();

    return new Response(forward, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});