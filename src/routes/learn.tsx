import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { categories } from "@/components/italian/data";
import { fetchLearnedWords } from "@/lib/progress";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
});

function LearnPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [learned, setLearned] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchLearnedWords(user.id).then((w) => setLearned(new Set(w.map((x) => x.word_it))));
  }, [user]);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Vocabulary <em className="font-display italic text-primary">decks</em>
      </h1>
      <p className="mt-2 text-muted-foreground">Pick a topic. Flip cards, take the quiz, earn XP.</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {categories.map((c) => {
          const known = c.phrases.filter((p) => learned.has(p.it)).length;
          const pct = Math.round((known / c.phrases.length) * 100);
          return (
            <Link
              key={c.id}
              to="/learn/$deckId"
              params={{ deckId: c.id }}
              className="group rounded-2xl border border-border/60 bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl">{c.emoji}</div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.blurb}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{known} / {c.phrases.length} learned</span>
                  <span>{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: "var(--gradient-warm)" }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}