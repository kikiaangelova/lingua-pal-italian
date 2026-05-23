import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Brain, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/italian/PageHeader";
import { setLastActivity } from "@/lib/last-activity";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "Luca — Your AI Italian Tutor" },
      {
        name: "description",
        content:
          "Chat with Luca, your Gen Z Italian mentor and coach. He remembers your mistakes and guides every step toward fluency.",
      },
      { property: "og:title", content: "Luca — Your AI Italian Tutor" },
      {
        property: "og:description",
        content:
          "Chat with Luca, your Gen Z Italian mentor and coach. He remembers your mistakes and guides every step toward fluency.",
      },
      { property: "og:url", content: "https://lingua-pal-italian.lovable.app/tutor" },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "canonical", href: "https://lingua-pal-italian.lovable.app/tutor" },
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
  const [mistakesOpen, setMistakesOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load prior conversation + tracked mistakes so Luca feels like he remembers
  useEffect(() => {
    if (!user) return;
    const loadMistakes = async () => {
      const { data: mks } = await supabase
        .from("tutor_mistakes")
        .select("topic, note, count")
        .eq("user_id", user.id)
        .order("last_seen", { ascending: false })
        .limit(6);
      if (mks) setMistakes(mks as any);
    };
    (async () => {
      const [{ data: hist }] = await Promise.all([
        supabase
          .from("tutor_messages")
          .select("role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(60),
      ]);
      if (hist && hist.length) {
        setMessages(
          hist.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: stripTags(m.content as string),
          })),
        );
      }
      await loadMistakes();
    })();

    // Realtime: keep "Luca remembers" panel in sync as the server logs new mistakes
    const channel = supabase
      .channel(`tutor-mistakes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tutor_mistakes",
          filter: `user_id=eq.${user.id}`,
        },
        () => loadMistakes(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      // (realtime channel above handles this automatically)
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
    <main className="mx-auto flex h-[100dvh] max-w-2xl flex-col px-3 pt-4 sm:px-4 sm:pt-6" style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <PageHeader title="Luca" crumbs={[{ label: "Luca" }]} />
      <header className="mb-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" /> AI Tutor
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold leading-none sm:text-4xl">
          Luca <em className="italic text-primary">— il tuo mentore</em>
        </h1>
        {mistakes.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-accent/40 text-xs">
            <button
              onClick={() => setMistakesOpen((v) => !v)}
              aria-expanded={mistakesOpen}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition active:scale-[0.99]"
            >
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Brain className="h-3.5 w-3.5 text-primary" /> Luca remembers
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  {mistakes.length}
                </span>
              </span>
              {mistakesOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {mistakesOpen && (
              <ul className="space-y-1 border-t border-border/60 px-3 py-2 text-muted-foreground">
                {mistakes.map((m) => (
                  <li key={m.topic} className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-foreground">{m.topic}</span>
                      {m.note ? <span className="block text-[11px] opacity-90">{m.note}</span> : null}
                    </div>
                    {m.count > 1 && (
                      <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                        ×{m.count}
                      </span>
                    )}
                    <button
                      aria-label={`Mark ${m.topic} resolved`}
                      onClick={async () => {
                        if (!user) return;
                        await supabase
                          .from("tutor_mistakes")
                          .delete()
                          .eq("user_id", user.id)
                          .eq("topic", m.topic);
                        // realtime will refresh, but optimistic too:
                        setMistakes((prev) => prev.filter((x) => x.topic !== m.topic));
                      }}
                      className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-background hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur sm:rounded-3xl sm:p-4"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              "max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:px-4 sm:py-3 " +
              (m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground")
            }
          >
            {m.content || <span className="opacity-50">…</span>}
          </div>
        ))}
      </div>

      <div
        className="sticky bottom-0 mt-3 flex items-end gap-2 bg-gradient-to-t from-background via-background/90 to-transparent pt-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
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
          aria-label="Message Luca"
          placeholder="Scrivi a Luca… (Enter to send)"
          className="min-h-[48px] flex-1 resize-none rounded-2xl border border-border/60 bg-card px-4 py-3 text-base outline-none focus:border-primary sm:text-sm"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </main>
  );
}