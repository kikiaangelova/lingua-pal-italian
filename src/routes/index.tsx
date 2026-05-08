import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Volume2, BookOpen, Mic, GraduationCap, ScrollText, Flame, Trophy, ArrowRight, UserPlus, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchProgress, levelFor, DAILY_GOAL } from "@/lib/progress";
import { wordOfDay } from "@/components/italian/data";
import { speakIt } from "@/lib/speak";
import { supabase } from "@/integrations/supabase/client";
import bgVideo from "@/assets/italy-bg.mp4.asset.json";
import avatarDemo from "@/assets/avatar-demo.jpg";

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
  const navigate = useNavigate();
  const [progress, setProgress] = useState<{
    xp: number;
    streak: number;
    daily_xp: number;
    daily_date: string | null;
  } | null>(null);
  const [name, setName] = useState<string>("");
  const [following, setFollowing] = useState(false);

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
      .select("display_name, onboarded")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && !data.onboarded) {
          navigate({ to: "/onboarding" });
          return;
        }
        setName(data?.display_name ?? "");
      });
  }, [user, navigate]);

  const today = new Date().toISOString().slice(0, 10);
  const dailyXp = progress?.daily_date === today ? progress?.daily_xp ?? 0 : 0;
  const goalPct = Math.min(100, Math.round((dailyXp / DAILY_GOAL) * 100));
  const lvl = levelFor(progress?.xp ?? 0);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-6">
      {/* HERO with video bg */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl">
        <video
          src={bgVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-primary/40" />
        <div className="relative z-10 px-6 py-14 sm:px-10 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur">
            <Sparkles className="h-3 w-3" /> Ciao{name ? `, ${name}` : ""}
          </span>
          <h1 className="mt-4 text-5xl font-extrabold leading-[0.9] text-white sm:text-7xl">
            Learn italian
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-zest)" }}
            >
              is easy.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base text-white/80 sm:text-lg">
            Not blocks. Not boring drills. Live the <em>vibe</em> — fashion, food, sport, culture — with Luca, your AI mentor.
          </p>
          <Link
            to="/tutor"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-foreground transition hover:scale-105"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            Talk to Luca <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Profile card */}
      <section className="-mt-8 mx-auto flex max-w-md items-center gap-4 rounded-3xl border border-white/30 bg-white/60 p-4 backdrop-blur-xl dark:bg-white/5"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <img
          src={avatarDemo}
          alt="Profile"
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover ring-2 ring-primary"
        />
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg leading-tight">{name || "Studente"}</div>
          <div className="text-xs text-muted-foreground">{lvl.current.name} · {progress?.xp ?? 0} XP</div>
        </div>
        <button
          onClick={() => setFollowing((v) => !v)}
          className={
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition hover:scale-105 " +
            (following
              ? "bg-muted text-foreground"
              : "bg-primary text-primary-foreground")
          }
        >
          {following ? <><Check className="h-3.5 w-3.5" /> Following</> : <><UserPlus className="h-3.5 w-3.5" /> Follow</>}
        </button>
      </section>

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
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
