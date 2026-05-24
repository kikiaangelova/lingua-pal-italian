import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Volume2, ArrowRight, Sparkles, Check } from "lucide-react";
import { speakIt, loadVoices } from "@/lib/speak";
import italyHero from "@/assets/italy-hero.mp4.asset.json";

export const Route = createFileRoute("/try")({
  head: () => ({
    meta: [
      { title: "Try a free Italian lesson — Ciao" },
      {
        name: "description",
        content: "Hear native Italian and learn 6 essential phrases — no sign-up needed.",
      },
      { property: "og:title", content: "Try a free Italian lesson — Ciao" },
      {
        property: "og:description",
        content:
          "Tap any phrase to hear native Italian pronunciation. Six essential phrases, no account required — start in 30 seconds.",
      },
      { property: "og:url", content: "https://tryitalian.com/try" },
    ],
    links: [
      { rel: "canonical", href: "https://tryitalian.com/try" },
    ],
  }),
  component: TryPage,
});

const SAMPLE = [
  { it: "Ciao!", en: "Hi / Bye", pron: "chow" },
  { it: "Buongiorno", en: "Good morning", pron: "bwon-JOR-no" },
  { it: "Grazie mille", en: "Thank you so much", pron: "GRAT-zye MIL-le" },
  { it: "Un caffè, per favore", en: "An espresso, please", pron: "oon kaf-FEH" },
  { it: "Quanto costa?", en: "How much is it?", pron: "KWAN-to KO-sta" },
  { it: "A presto!", en: "See you soon!", pron: "a PRES-to" },
];

function TryPage() {
  const [heard, setHeard] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadVoices();
  }, []);

  const play = (i: number, text: string) => {
    speakIt(text);
    setHeard((prev) => new Set(prev).add(i));
  };

  const done = heard.size >= 3;

  return (
    <main className="relative mx-auto max-w-2xl px-5 pb-16 pt-6">
      {/* Cinematic Italy background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <video
          src={italyHero.url}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      </div>
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" /> Free sample · no sign-up
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
          Hear Italian. <em className="italic text-primary">Right now.</em>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tap any phrase to hear native pronunciation.
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {SAMPLE.map((p, i) => {
          const wasHeard = heard.has(i);
          return (
            <li
              key={p.it}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <button
                onClick={() => play(i, p.it)}
                aria-label={`Play ${p.it}`}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition active:scale-95"
                style={{ boxShadow: "var(--shadow-warm)" }}
              >
                <Volume2 className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-xl font-semibold text-foreground">
                  {p.it}
                </div>
                <div className="text-xs text-muted-foreground">
                  /{p.pron}/ — {p.en}
                </div>
              </div>
              {wasHeard && <Check className="h-5 w-5 text-primary" aria-hidden />}
            </li>
          );
        })}
      </ul>

      <section
        className={
          "mt-8 rounded-3xl border p-5 transition " +
          (done ? "border-primary/40 bg-accent/40" : "border-border/60 bg-card")
        }
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {done ? "Bravo!" : `Heard ${heard.size}/3 to unlock`}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold">
          {done ? "Save your streak & meet Luca" : "Try 3 phrases to continue"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign up free to track progress, get a daily goal, and chat with Luca — your AI Italian
          mentor who remembers every session.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:scale-105"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          Continue free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}