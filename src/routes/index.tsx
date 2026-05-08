import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Volume2, BookOpen, Mic, GraduationCap, ScrollText, Flame, Trophy, ArrowRight, UserPlus, Check, MapPin, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchProgress, levelFor, DAILY_GOAL, fetchCompletedLessons } from "@/lib/progress";
import { wordOfDay } from "@/components/italian/data";
import { lessons } from "@/components/italian/lessons";
import { speakIt } from "@/lib/speak";
import { supabase } from "@/integrations/supabase/client";
import bgVideo from "@/assets/italy-bg.mp4.asset.json";
import italyHero from "@/assets/italy-hero.mp4.asset.json";
import avatarDemo from "@/assets/avatar-demo.jpg";
import { getLastActivity } from "@/lib/last-activity";

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

  if (loading) return <LoadingSplash />;
  if (!user) return <GuestHome />;

  return <Dashboard />;
}

function LoadingSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="font-display text-3xl italic text-muted-foreground">Un momento…</div>
    </div>
  );
}

function GuestHome() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-5 sm:pt-6">
      {/* Cinematic hero — same energy as desktop, tuned for mobile */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl sm:rounded-[2rem]">
        <video
          src={italyHero.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/40 to-primary/40" />
        <div className="relative z-10 px-5 py-10 sm:px-10 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur">
            <Sparkles className="h-3 w-3" /> No sign-up. No fluff.
          </span>
          <h1 className="mt-4 text-5xl font-extrabold leading-[0.9] text-white sm:text-7xl">
            Italiano,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-zest)" }}
            >
              senza filtri.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">
            Tap. Hear native Italian. Roast yourself in a quiz. Meet Luca — the AI mentor who actually remembers you. Free, no email wall.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/learn/$deckId"
              params={{ deckId: "greetings" }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-foreground transition active:scale-95 sm:hover:scale-105"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              Start a quiz <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/try"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur"
            >
              <Volume2 className="h-4 w-4" /> Hear it first
            </Link>
          </div>
        </div>
      </section>

      {/* Quick-pick lesson deep-links */}
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Pick your vibe</h2>
          <Link to="/grammar" className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {lessons.slice(0, 6).map((l) => (
            <Link
              key={l.id}
              to="/grammar/$lessonId"
              params={{ lessonId: l.id }}
              className="group rounded-2xl border border-border/60 bg-card p-4 transition active:scale-[0.98] hover:-translate-y-0.5 hover:border-primary/40"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="text-2xl">{l.emoji}</div>
              <div className="mt-2 font-display text-base font-semibold leading-tight text-foreground">
                {l.title}
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{l.blurb}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Tile to="/speak" icon={<Mic className="h-6 w-6" />} title="Speak" subtitle="Hear Italian and repeat it now" />
        <Tile to="/read" icon={<ScrollText className="h-6 w-6" />} title="Read" subtitle="Open a mini-story and do the check" />
      </section>

      {/* Sign-up nudge */}
      <section
        className="mt-6 overflow-hidden rounded-3xl border border-primary/30 p-5 sm:p-6"
        style={{ background: "var(--gradient-soft)", boxShadow: "var(--shadow-warm)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Level up</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Keep your streak. Make Luca yours.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign up free — your XP, journey map, and Luca's memory of your mistakes follow you everywhere.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition active:scale-95 sm:hover:scale-105"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          Create free account <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
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
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

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
    const reloadLessons = () =>
      fetchCompletedLessons(user.id).then((rows) =>
        setCompletedIds(new Set(rows.map((r) => r.lesson_id))),
      );
    reloadLessons();

    // Realtime: refresh journey when a lesson is completed
    const channel = supabase
      .channel(`lesson-completion-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lesson_completion",
          filter: `user_id=eq.${user.id}`,
        },
        () => reloadLessons(),
      )
      .subscribe();

    // Refresh whenever the tab regains focus
    const onFocus = () => reloadLessons();
    window.addEventListener("focus", onFocus);

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

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, navigate]);

  const today = new Date().toISOString().slice(0, 10);
  const dailyXp = progress?.daily_date === today ? progress?.daily_xp ?? 0 : 0;
  const goalPct = Math.min(100, Math.round((dailyXp / DAILY_GOAL) * 100));
  const lvl = levelFor(progress?.xp ?? 0);
  const last = getLastActivity();
  const continueTo = last?.to ?? "/learn";
  const continueLabel = last?.label ?? "Vocabulary decks";

  // Build journey: first incomplete lesson is "current"
  const currentIdx = Math.max(0, lessons.findIndex((l) => !completedIds.has(l.id)));
  const safeCurrent = currentIdx === -1 ? lessons.length - 1 : currentIdx;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-5 sm:pt-6">
      {/* HERO with video bg */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl sm:rounded-[2rem]">
        <video
          src={bgVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-primary/40" />
        <div className="relative z-10 px-5 py-10 sm:px-10 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur">
            <Sparkles className="h-3 w-3" /> Ciao{name ? `, ${name}` : ""}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[0.95] text-white sm:text-7xl">
            Learn italian
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-zest)" }}
            >
              is easy.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/80 sm:mt-4 sm:text-lg">
            Not blocks. Not boring drills. Live the <em>vibe</em> — fashion, food, sport, culture — with Luca, your AI mentor.
          </p>
          <Link
            to="/tutor"
            className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-foreground transition active:scale-95 sm:hover:scale-105"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            Talk to Luca <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Continue learning */}
      <section
        className="mt-6 flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card p-4 sm:p-5"
        style={{ boxShadow: "var(--shadow-warm)" }}
      >
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:text-xs">
            {last ? "Continue learning" : "Start learning"}
          </p>
          <h2 className="mt-1 truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
            {continueLabel}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: continueTo as any })}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition active:scale-95 sm:px-5 sm:py-3 sm:hover:scale-105"
        >
          {last ? "Continue" : "Start"} <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* Profile card */}
      <section className="mt-4 mx-auto flex max-w-md items-center gap-3 rounded-3xl border border-white/30 bg-white/60 p-3 backdrop-blur-xl dark:bg-white/5 sm:-mt-8 sm:gap-4 sm:p-4"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <img
          src={avatarDemo}
          alt="Profile"
          width={64}
          height={64}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-primary sm:h-16 sm:w-16"
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

      {/* Journey / learning map */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-2xl font-semibold">Your journey</h3>
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {completedIds.size}/{lessons.length} lessons
          </span>
        </div>
        <ol className="relative space-y-2 border-l-2 border-dashed border-border/60 pl-5">
          {lessons.map((l, i) => {
            const done = completedIds.has(l.id);
            const isCurrent = i === safeCurrent && !done;
            const locked = i > safeCurrent && !done;
            return (
              <li key={l.id} className="relative">
                <span
                  className={
                    "absolute -left-[30px] top-3 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ring-4 ring-background " +
                    (done
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-secondary text-secondary-foreground animate-pulse"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : isCurrent ? <MapPin className="h-3.5 w-3.5" /> : locked ? <Lock className="h-3 w-3" /> : i + 1}
                </span>
                <Link
                  to="/grammar/$lessonId"
                  params={{ lessonId: l.id }}
                  className={
                    "block rounded-2xl border p-3 transition " +
                    (isCurrent
                      ? "border-primary/50 bg-card"
                      : done
                        ? "border-border/40 bg-card/60"
                        : "border-border/60 bg-card hover:border-primary/30")
                  }
                  style={isCurrent ? { boxShadow: "var(--shadow-warm)" } : undefined}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-base font-semibold">
                        {l.emoji} {l.title}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{l.blurb}</div>
                    </div>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                        You're here
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
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
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate({ to: to as any })}
      className="group block w-full cursor-pointer rounded-2xl border border-border/60 bg-card p-4 text-left transition active:scale-[0.98] hover:-translate-y-0.5 hover:border-primary/40 min-h-[88px]"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition group-hover:scale-110">
        {icon}
      </div>
      <div className="mt-3 font-display text-xl font-semibold text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </button>
  );
}
