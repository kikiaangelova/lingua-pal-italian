import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Server-side Italian neural TTS via ElevenLabs.
// Returns raw MP3 bytes. If ELEVENLABS_API_KEY isn't set, returns 503
// and the client falls back to browser speech synthesis.

// "Bianca" — natural Italian female voice (multilingual v2 sounds native in IT)
const ITALIAN_VOICE_ID = "XB0fDUnXU5powFXDhCwa";

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "tts_not_configured" }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }

        // Require an authenticated Supabase user to prevent anonymous
        // abuse of paid ElevenLabs quota.
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        if (!token) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response(JSON.stringify({ error: "server_misconfigured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } = await authClient.auth.getUser(token);
        if (userErr || !userData?.user) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        let text = "";
        try {
          const body = (await request.json()) as { text?: string };
          text = (body.text ?? "").toString().trim().slice(0, 600);
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        if (!text) return new Response("Missing text", { status: 400 });

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${ITALIAN_VOICE_ID}?output_format=mp3_44100_128`;
        const r = await fetch(url, {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.8,
              style: 0.35,
              use_speaker_boost: true,
              speed: 0.95,
            },
          }),
        });

        if (!r.ok) {
          const msg = await r.text().catch(() => "");
          // Log upstream details server-side only; never echo upstream
          // response bodies back to the browser.
          console.error("[tts] ElevenLabs upstream error", r.status, msg);
          return new Response(JSON.stringify({ error: "tts_unavailable" }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
          });
        }

        const buf = await r.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});