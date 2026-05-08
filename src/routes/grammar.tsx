import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { lessons } from "@/components/italian/lessons";
import { fetchCompletedLessons } from "@/lib/progress";

export const Route = createFileRoute("/grammar")({
  component: GrammarPage,
});

function GrammarPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchCompletedLessons(user.id).then((d) => setDone(new Set(d.map((x) => x.lesson_id))));
  }, [user]);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Grammar, <em className="font-display italic text-primary">passo a passo</em>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Each lesson unlocks the next. Take your time.
      </p>

      <ol className="mt-8 space-y-3">
        {lessons.map((l, idx) => {
          const isDone = done.has(l.id);
          const prevDone = idx === 0 || done.has(lessons[idx - 1].id);
          const locked = !prevDone;
          const Tag: any = locked ? "div" : Link;
          return (
            <Tag
              key={l.id}
              {...(!locked ? { to: "/grammar/$lessonId", params: { lessonId: l.id } } : {})}
              className={
                "group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition " +
                (locked ? "opacity-60" : "hover:-translate-y-0.5 hover:border-primary/40")
              }
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
              {locked ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : isDone ? (
                <CheckCircle2 className="h-6 w-6 text-secondary" />
              ) : (
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              )}
            </Tag>
          );
        })}
      </ol>
    </main>
  );
}