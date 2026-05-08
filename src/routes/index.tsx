import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Volume2, BookOpen, Mic, GraduationCap, ScrollText, Flame, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchProgress, levelFor, DAILY_GOAL } from "@/lib/progress";
import { wordOfDay } from "@/components/italian/data";
import { speakIt } from "@/lib/speak";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ciao — Your Italian journey" },
      {
        name: "description",
        content: "Daily vocabulary, speaking, grammar and reading. Buongiorno!",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);
  if (loading || !user) return <LoadingSplash />;
  return <Dashboard />;
}

function LoadingSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="font-display text-3xl italic text-muted-foreground">Un momento…</div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<{
    xp: number;
    streak: number;
    daily_xp: number;
    daily_date: string | null;
  } | null>(null);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    fetchProgress(user.id).then((p) =>
      setProgress({
        xp: p?.xp ?? 0,
        streak: p?.streak ?? 0,
        daily_xp: p?.daily_xp ?? 0,
        daily_date: p?.daily_date ?? null,
      }),
    );
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setName(data?.display_name ?? ""));
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);
  const dailyXp = progress?.daily_date === today ? progress?.daily_xp ?? 0 : 0;
  const goalPct = Math.min(100, Math.round((dailyXp / DAILY_GOAL) * 100));
  const lvl = levelFor(progress?.xp ?? 0);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" /> Ciao{name ? `, ${name}` : ""}
          </span>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Pronto per <em className="font-display italic text-primary">imparare?</em>
          </h1>
        </div>
      </header>

      {/* Streak + Level + Daily goal */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Flame className="h-5 w-5 text-primary" />}
          label="Streak"
          value={`${progress?.streak ?? 0} ${(progress?.streak ?? 0) === 1 ? "day" : "days"}`}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-secondary" />}
          label="Level"
          value={lvl.current.name}
        />
        <div
          className="col-span-2 rounded-2xl border border-border/60 bg-card p-4 sm:col-span-1"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
            <span>Daily goal</span>
            <span className="font-semibold text-foreground">
              {dailyXp}/{DAILY_GOAL} XP
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${goalPct}%`, background: "var(--gradient-warm)" }}
            />
          </div>
        </div>
      </section>

      {/* Word of the day */}
      <section
        className="mt-6 overflow-hidden rounded-3xl border border-border/60 p-6"
        style={{ background: "var(--gradient-soft)", boxShadow: "var(--shadow-soft)" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Frase del giorno</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">{wordOfDay.it}</h2>
        <p className="mt-1 text-muted-foreground">
          <span className="italic">/{wordOfDay.pron}/</span> — {wordOfDay.en}
        </p>
        <button
          onClick={() => speakIt(wordOfDay.it)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          <Volume2 className="h-4 w-4" /> Ascolta
        </button>
      </section>

      {/* Pillars */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile to="/learn" icon={<BookOpen className="h-6 w-6" />} title="Vocab" subtitle="Decks & quiz" />
        <Tile to="/speak" icon={<Mic className="h-6 w-6" />} title="Speak" subtitle="Listen & repeat" />
        <Tile to="/grammar" icon={<GraduationCap className="h-6 w-6" />} title="Grammar" subtitle="Step by step" />
        <Tile to="/read" icon={<ScrollText className="h-6 w-6" />} title="Read" subtitle="Mini stories" />
      </section>

      <p className="mt-12 text-center text-sm italic text-muted-foreground">
        Fatto con <span className="text-primary">♥</span> — a presto!
      </p>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border border-border/60 bg-card p-4"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Tile({
  to,
  icon,
  title,
  subtitle,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition group-hover:scale-110">
        {icon}
      </div>
      <div className="mt-3 font-display text-xl font-semibold text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </Link>
  );
}
