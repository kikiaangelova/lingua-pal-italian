import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Sparkles, Check, Flame, Mic, BookOpen, GraduationCap, ScrollText, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — Set up your Italian journey" },
      { name: "description", content: "Tell Luca about your goals and we'll build your daily plan." },
    ],
  }),
  component: OnboardingPage,
});

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const MOTIVATIONS = [
  { id: "culture", emoji: "🎨", label: "Culture & lifestyle" },
  { id: "travel", emoji: "✈️", label: "Travel in Italy" },
  { id: "work", emoji: "💼", label: "Work or study" },
  { id: "love", emoji: "❤️", label: "Family or love" },
  { id: "fun", emoji: "🎬", label: "Just for fun" },
];

const CURRENT_LEVELS = [
  { id: "zero", label: "Total beginner", sub: "Ciao is about it" },
  { id: "a1", label: "A1 — Basics", sub: "I know a few phrases" },
  { id: "a2", label: "A2 — Survival", sub: "I can order coffee" },
  { id: "b1", label: "B1 — Intermediate", sub: "I can hold a chat" },
  { id: "b2", label: "B2 — Solid", sub: "Comfortable in most topics" },
];

const GOALS = [
  { id: "a2", label: "A2", sub: "Travel-ready" },
  { id: "b1", label: "B1", sub: "Daily conversation" },
  { id: "b2", label: "B2", sub: "Work & study" },
  { id: "c1", label: "C1", sub: "Fluent & confident" },
  { id: "c2", label: "C2", sub: "Native-like" },
];

const MINUTES = [5, 10, 15, 30];

function OnboardingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [goalLevel, setGoalLevel] = useState<string | null>("c1");
  const [minutes, setMinutes] = useState<number>(10);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, onboarded")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setName(data.display_name);
        if (data?.onboarded) navigate({ to: "/" });
      });
  }, [user, navigate]);

  const next = () => setStep((s) => Math.min(5, s + 1) as Step);
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const finish = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: name || "Studente",
        motivation,
        current_level: currentLevel,
        goal_level: goalLevel,
        daily_minutes: minutes,
        onboarded: true,
      });
      if (error) throw error;
      toast.success("Andiamo! Your plan is ready.");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-display text-2xl italic text-muted-foreground">Un momento…</div>
      </div>
    );
  }

  const canNext =
    (step === 0) ||
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && !!motivation) ||
    (step === 3 && !!currentLevel) ||
    (step === 4 && !!goalLevel) ||
    (step === 5 && !!minutes);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-8">
      {/* progress bar */}
      <div className="mb-8 flex items-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden"
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: step >= i ? "100%" : "0%",
                background: "var(--gradient-warm)",
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex-1">
        {step === 0 && <StepWelcome onStart={next} />}
        {step === 1 && <StepName name={name} setName={setName} />}
        {step === 2 && <StepMotivation value={motivation} onChange={setMotivation} />}
        {step === 3 && <StepCurrent value={currentLevel} onChange={setCurrentLevel} />}
        {step === 4 && <StepGoal value={goalLevel} onChange={setGoalLevel} />}
        {step === 5 && <StepPlan minutes={minutes} setMinutes={setMinutes} name={name} goal={goalLevel} />}
      </div>

      {/* nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            onClick={back}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <span />
        )}

        {step < 5 ? (
          <button
            onClick={next}
            disabled={!canNext}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            {step === 0 ? "Start" : "Continue"} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={busy}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:scale-105 disabled:opacity-60"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            {busy ? "Saving…" : "Andiamo! 🇮🇹"} <Sparkles className="h-4 w-4" />
          </button>
        )}
      </div>
    </main>
  );
}

function StepWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" /> Benvenuto
      </span>
      <h1 className="mt-4 text-5xl font-extrabold leading-[0.95] text-foreground sm:text-6xl">
        Let's build your
        <br />
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-zest)" }}>
          Italian flow.
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
        In 60 seconds Luca will design your daily plan. No grammar drills — just real Italian, the way Italians live it.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <FlowCard icon={<BookOpen className="h-5 w-5" />} step="1" title="Vocab decks" body="Themed words with native audio. Quizzes that adapt to you." />
        <FlowCard icon={<Mic className="h-5 w-5" />} step="2" title="Speak it" body="Record yourself, listen back, copy the rhythm." />
        <FlowCard icon={<GraduationCap className="h-5 w-5" />} step="3" title="Bite-size grammar" body="One concept at a time. Always with examples." />
        <FlowCard icon={<ScrollText className="h-5 w-5" />} step="4" title="Read short stories" body="Tap any word for translation + audio." />
        <FlowCard icon={<Sparkles className="h-5 w-5" />} step="5" title="Talk to Luca" body="Your AI tutor. Ask anything, anytime." />
        <FlowCard icon={<Flame className="h-5 w-5" />} step="6" title="Build a streak" body="One thing a day keeps the streak alive 🔥" />
      </div>
    </div>
  );
}

function FlowCard({ icon, step, title, body }: { icon: React.ReactNode; step: string; title: string; body: string }) {
  return (
    <div
      className="rounded-2xl border border-border/60 bg-card p-4"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Step {step}</span>
      </div>
      <div className="mt-2 font-display text-lg font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground">{body}</div>
    </div>
  );
}

function StepName({ name, setName }: { name: string; setName: (v: string) => void }) {
  return (
    <div>
      <h2 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
        Come ti chiami?
      </h2>
      <p className="mt-2 text-muted-foreground">What should Luca call you?</p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Maria"
        className="mt-6 w-full rounded-2xl border border-input bg-background px-5 py-4 text-2xl font-semibold text-foreground outline-none transition focus:border-primary"
      />
    </div>
  );
}

function StepMotivation({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
        Perché l'italiano?
      </h2>
      <p className="mt-2 text-muted-foreground">Why Italian? Pick the one that hits hardest.</p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MOTIVATIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={
              "flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 " +
              (value === m.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40")
            }
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="flex-1 font-semibold text-foreground">{m.label}</span>
            {value === m.id && <Check className="h-5 w-5 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepCurrent({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
        Where are you now?
      </h2>
      <p className="mt-2 text-muted-foreground">Honest answers = better plan.</p>
      <div className="mt-6 space-y-3">
        {CURRENT_LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => onChange(l.id)}
            className={
              "flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 " +
              (value === l.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40")
            }
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div>
              <div className="font-display text-lg font-semibold text-foreground">{l.label}</div>
              <div className="text-sm text-muted-foreground">{l.sub}</div>
            </div>
            {value === l.id && <Check className="h-5 w-5 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepGoal({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
        What's the dream?
      </h2>
      <p className="mt-2 text-muted-foreground">Pick a target level. Most learners aim for C1.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => onChange(g.id)}
            className={
              "flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition hover:-translate-y-0.5 " +
              (value === g.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40")
            }
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <Trophy className={"h-5 w-5 " + (value === g.id ? "text-primary" : "text-muted-foreground")} />
            <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{g.label}</div>
            <div className="text-[11px] text-muted-foreground">{g.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPlan({
  minutes,
  setMinutes,
  name,
  goal,
}: {
  minutes: number;
  setMinutes: (n: number) => void;
  name: string;
  goal: string | null;
}) {
  return (
    <div>
      <h2 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
        How much time, {name || "amico"}?
      </h2>
      <p className="mt-2 text-muted-foreground">
        Pick your daily commitment. One session a day keeps your 🔥 streak alive.
      </p>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {MINUTES.map((m) => (
          <button
            key={m}
            onClick={() => setMinutes(m)}
            className={
              "flex flex-col items-center rounded-2xl border-2 p-4 transition hover:-translate-y-0.5 " +
              (minutes === m ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40")
            }
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="font-display text-3xl font-extrabold text-foreground">{m}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">min/day</div>
          </button>
        ))}
      </div>

      <div
        className="mt-8 rounded-3xl border border-border/60 p-6"
        style={{ background: "var(--gradient-soft)", boxShadow: "var(--shadow-soft)" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Your plan</p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">
          {minutes} min/day → {(goal || "C1").toUpperCase()}
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-primary" />
            <span><strong>Daily warm-up</strong> — 1 vocab deck + 1 speaking phrase.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-primary" />
            <span><strong>One grammar bite</strong> every 2 days — small, stackable wins.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-primary" />
            <span><strong>Story of the week</strong> — read with tap-to-translate.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-primary" />
            <span><strong>Talk to Luca</strong> whenever — he's your AI mentor & coach.</span>
          </li>
          <li className="flex items-start gap-2">
            <Flame className="mt-0.5 h-4 w-4 text-primary" />
            <span>Complete <strong>1 thing per day</strong> to keep your streak alive.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}