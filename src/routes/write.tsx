import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Check, PenLine, Volume2, Eye, EyeOff, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/italian/PageHeader";
import { useAuth } from "@/lib/auth";
import { speakIt } from "@/lib/speak";
import { awardXp } from "@/lib/progress";
import { toast } from "sonner";
import { setLastActivity } from "@/lib/last-activity";
import { useEffect } from "react";

export const Route = createFileRoute("/write")({
  head: () => ({
    meta: [
      { title: "Writing practice — Ciao" },
      {
        name: "description",
        content:
          "Write in Italian every day. Short guided prompts with native audio and self-check feedback so you actually retain what you learn.",
      },
      { property: "og:title", content: "Writing practice — Ciao" },
      {
        property: "og:description",
        content:
          "Write in Italian every day. Short guided prompts with native audio and self-check feedback.",
      },
      { property: "og:url", content: "https://tryitalian.com/write" },
    ],
    links: [{ rel: "canonical", href: "https://tryitalian.com/write" }],
  }),
  component: WritePage,
});

type Prompt = {
  en: string;
  it: string;
  hint: string;
};

const PROMPTS: Prompt[] = [
  {
    en: "Say hello and introduce yourself with your name.",
    it: "Ciao, mi chiamo Marco.",
    hint: "Start with a greeting, then use mi chiamo.",
  },
  {
    en: "Order an espresso politely at a bar.",
    it: "Un caffè, per favore.",
    hint: "Keep it short. Italians order in a few words.",
  },
  {
    en: "Ask how much something costs.",
    it: "Quanto costa?",
    hint: "Two words is enough.",
  },
  {
    en: "Say you are learning Italian.",
    it: "Sto imparando l'italiano.",
    hint: "Use the present continuous: stare + gerund.",
  },
  {
    en: "Say you don't understand and ask them to repeat.",
    it: "Non capisco. Può ripetere, per favore?",
    hint: "Combine two short sentences.",
  },
  {
    en: "Tell a friend you'll see them tomorrow.",
    it: "Ci vediamo domani.",
    hint: "Use ci vediamo for ‘see you’.",
  },
  {
    en: "Ask where the train station is.",
    it: "Dov'è la stazione?",
    hint: "Dove + è contracts to dov'è.",
  },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  const A = normalize(a);
  const B = normalize(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  const aw = new Set(A.split(" "));
  const bw = B.split(" ");
  const hits = bw.filter((w) => aw.has(w)).length;
  return hits / Math.max(aw.size, bw.length);
}

function WritePage() {
  const { user } = useAuth();
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (user) setLastActivity({ to: "/write", label: "Writing practice" });
  }, [user]);

  const prompt = PROMPTS[i];
  const done = useMemo(() => score !== null && score >= 0.6, [score]);

  const check = () => {
    const s = similarity(answer, prompt.it);
    setScore(s);
    setRevealed(true);
  };

  const next = async () => {
    if (done && user) {
      await awardXp(user.id, 5);
      toast.success("+5 XP", { duration: 900 });
    }
    setAnswer("");
    setRevealed(false);
    setScore(null);
    setI((i + 1) % PROMPTS.length);
  };

  const listen = async () => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const r = await speakIt(prompt.it);
      if (!r.ok) toast.error(r.message);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <PageHeader title="Writing" crumbs={[{ label: "Writing" }]} />
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Daily <em className="font-display italic text-primary">writing</em>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Write it in Italian. Reveal the native answer. Hear how it sounds.
      </p>

      <div className="mt-4 text-sm text-muted-foreground">
        Prompt {i + 1} / {PROMPTS.length}
      </div>

      <section
        className="mt-3 rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
        style={{ boxShadow: "var(--shadow-warm)" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Translate to Italian
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {prompt.en}
        </h2>
        <p className="mt-1 text-sm italic text-muted-foreground">Tip: {prompt.hint}</p>

        <label htmlFor="ans" className="sr-only">
          Your Italian answer
        </label>
        <textarea
          id="ans"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Scrivi qui in italiano…"
          rows={3}
          autoCapitalize="sentences"
          autoCorrect="off"
          spellCheck={false}
          className="mt-4 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-primary"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={check}
            disabled={!answer.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <Check className="h-4 w-4" /> Check
          </button>
          <button
            onClick={() => setRevealed((r) => !r)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {revealed ? "Hide" : "Reveal"}
          </button>
          <button
            onClick={listen}
            disabled={speaking}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            {speaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            Listen
          </button>
        </div>

        {revealed && (
          <div className="mt-5 rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Native answer
            </p>
            <p className="mt-1 font-display text-xl text-foreground">{prompt.it}</p>
            {score !== null && (
              <p className={"mt-2 text-sm " + (done ? "text-primary" : "text-muted-foreground")}>
                {done
                  ? "Bravissimo — close enough to native."
                  : "Quasi — compare yours with the native answer above and try the next prompt."}
              </p>
            )}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {!user && (
          <Link
            to="/login"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Save my writing <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <button
          onClick={next}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          <PenLine className="h-4 w-4" /> Next prompt
        </button>
      </div>
    </main>
  );
}