import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { stories } from "@/components/italian/stories";
import { fetchCompletedStories } from "@/lib/progress";
import { PageHeader } from "@/components/italian/PageHeader";
import { setLastActivity } from "@/lib/last-activity";

export const Route = createFileRoute("/read")({
  component: ReadPage,
});

function ReadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchCompletedStories(user.id).then((d) => setDone(new Set(d.map((x) => x.story_id))));
    setLastActivity({ to: "/read", label: "Mini stories" });
  }, [user]);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <PageHeader title="Stories" crumbs={[{ label: "Stories" }]} />
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Mini <em className="font-display italic text-primary">stories</em>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tap any word to translate & hear it. Italy in 5 sentences.
      </p>

      <div className="mt-8 grid gap-3">
        {stories.map((s) => (
          <Link
            key={s.id}
            to="/read/$storyId"
            params={{ storyId: s.id }}
            className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-2xl">{s.emoji}</div>
            <div className="flex-1">
              <div className="font-display text-lg font-semibold text-foreground">{s.title}</div>
              <div className="text-sm text-muted-foreground">
                {s.blurb} · <span className="font-mono text-xs">{s.level}</span>
              </div>
            </div>
            {done.has(s.id) ? (
              <CheckCircle2 className="h-6 w-6 text-secondary" />
            ) : (
              <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}