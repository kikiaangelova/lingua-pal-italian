import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Brain } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/italian/PageHeader";
import { setLastActivity } from "@/lib/last-activity";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "Luca — Your AI Italian Tutor" },
      { name: "description", content: "Chat with Luca, your Gen Z Italian mentor & coach." },
    ],
  }),
  component: TutorPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const MISTAKE_RE = /\[\[mistake:[^\]]+\]\]/gi;
const stripTags = (s: string) => s.replace(MISTAKE_RE, "").trim();

function TutorPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) setLastActivity({ to: "/tutor", label: "Chat with Luca" });
  }, [user]);

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Ciao! Sono **Luca**, your Italian mentor. Tell me — what do you want to nail today: ordering an espresso ☕, flirting at an aperitivo 🍹, or surviving a Serie A match 🟦? **Prossimo passo →** type your goal.",
    },
  ]);
  const [mistakes, setMistakes] = useState<{ topic: string; note: string | null; count: number }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load prior conversation + tracked mistakes so Luca feels like he remembers
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: hist }, { data: mks }] = await Promise.all([
        supabase
          .from("tutor_messages")
          .select("role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(60),
        supabase
          .from("tutor_mistakes")
          .select("topic, note, count")
          .eq("user_id", user.id)
          .order("last_seen", { ascending: false })
          .limit(6),
      ]);
      if (hist && hist.length) {
        setMessages(
          hist.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: stripTags(m.content as string),
          })),
        );
      }
      if (mks) setMistakes(mks as any);
    })();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-chat`;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in to use the tutor.");
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: next }),
      });
      if (!resp.ok || !resp.body) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || "Chat error");
      }
      const reader = resp.body.getReader();
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
            if (c) {
              acc += c;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: stripTags(acc) };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      // Refresh mistakes after a turn (server may have added new ones)
      if (user) {
        const { data: mks } = await supabase
          .from("tutor_mistakes")
          .select("topic, note, count")
          .eq("user_id", user.id)
          .order("last_seen", { ascending: false })
          .limit(6);
        if (mks) setMistakes(mks as any);
      }
    } catch (e) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Ops! Qualcosa è andato storto. Try again in a moment.",
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex h-[100dvh] max-w-2xl flex-col px-4 pb-28 pt-6">
      <PageHeader title="Luca" crumbs={[{ label: "Luca" }]} />
      <header className="mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" /> AI Tutor
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold leading-none">
          Luca <em className="italic text-primary">— il tuo mentore</em>
        </h1>
        {mistakes.length > 0 && (
          <div className="mt-3 rounded-2xl border border-border/60 bg-accent/40 p-3 text-xs">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
              <Brain className="h-3.5 w-3.5 text-primary" /> Luca remembers
            </div>
            <ul className="space-y-0.5 text-muted-foreground">
              {mistakes.map((m) => (
                <li key={m.topic}>
                  <span className="font-medium text-foreground">{m.topic}</span>
                  {m.note ? ` — ${m.note}` : ""}
                  {m.count > 1 ? ` (×${m.count})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-3xl border border-border/60 bg-card/60 p-4 backdrop-blur"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed " +
              (m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground")
            }
          >
            {m.content || <span className="opacity-50">…</span>}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Scrivi a Luca… (Enter to send)"
          className="min-h-[48px] flex-1 resize-none rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-sm outline-none backdrop-blur focus:border-primary"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </main>
  );
}