import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { lessons } from "@/components/italian/lessons";
import { fetchCompletedLessons } from "@/lib/progress";
import { PageHeader } from "@/components/italian/PageHeader";
import { setLastActivity } from "@/lib/last-activity";

export const Route = createFileRoute("/grammar/")({
  head: () => ({
    meta: [
      { title: "Grammar lessons — Ciao" },
      {
        name: "description",
        content:
          "Bite-size Italian grammar lessons with examples and quizzes — alphabet, articles, gender, essere & avere, -are verbs and more.",
      },
      { property: "og:title", content: "Grammar lessons — Ciao" },
      {
        property: "og:description",
        content:
          "Bite-size Italian grammar lessons with examples and quizzes — alphabet, articles, gender, essere & avere, -are verbs and more.",
      },
      { property: "og:url", content: "https://tryitalian.com/grammar" },
    ],
    links: [
      { rel: "canonical", href: "https://tryitalian.com/grammar" },
    ],
  }),
  component: GrammarPage,
});

function GrammarPage() {
  const { user, loading } = useAuth();
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchCompletedLessons(user.id).then((d) => setDone(new Set(d.map((x) => x.lesson_id))));
    }
    setLastActivity({ to: "/grammar", label: "Grammar lessons" });
  }, [user]);

  if (loading) return <LoadingState />;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <PageHeader title="Grammar" crumbs={[{ label: "Grammar" }]} />
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Grammar, <em className="font-display italic text-primary">passo a passo</em>
      </h1>
      <p className="mt-2 text-muted-foreground">Each lesson unlocks the next. Take your time.</p>

      <section
        className="mt-6 rounded-3xl border border-border/60 bg-accent/30 p-5"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Start here</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
          Learn → check → save progress
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open any lesson to read the explanation, hear examples, then take the quiz. Your score updates your journey map automatically.
        </p>
        <Link
          to="/grammar/$lessonId"
          params={{ lessonId: lessons[0]!.id }}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          Start first lesson <ArrowRight className="h-4 w-4" />
        </Link>
        {!user && (
          <p className="mt-3 text-xs text-muted-foreground">
            You can try lessons as a guest. Sign in only when you want your progress saved.
          </p>
        )}
      </section>

      <ol className="mt-8 space-y-3">
        {lessons.map((l, idx) => {
          const isDone = done.has(l.id);
          return (
            <Link
              key={l.id}
              to="/grammar/$lessonId"
              params={{ lessonId: l.id }}
              className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl">
                {l.emoji}
              </div>
              <div className="flex-1">
                <div className="font-display text-lg font-semibold text-foreground">
                  {idx + 1}. {l.title}
                </div>
                <div className="text-sm text-muted-foreground">{l.blurb}</div>
              </div>
              {isDone ? (
                <CheckCircle2 className="h-6 w-6 text-secondary" />
              ) : (
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              )}
            </Link>
          );
        })}
      </ol>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-5 py-12">
      <p className="font-display text-3xl italic text-muted-foreground">Un momento…</p>
    </main>
  );
}