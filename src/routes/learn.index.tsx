import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { categories } from "@/components/italian/data";
import { fetchLearnedWords } from "@/lib/progress";
import { PageHeader } from "@/components/italian/PageHeader";
import { setLastActivity } from "@/lib/last-activity";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Vocabulary decks — Ciao" },
      {
        name: "description",
        content:
          "Themed Italian vocabulary decks with native audio and quizzes — greetings, café, travel, food, feelings, numbers, family and time.",
      },
      { property: "og:title", content: "Vocabulary decks — Ciao" },
      {
        property: "og:description",
        content:
          "Themed Italian vocabulary decks with native audio and quizzes — greetings, café, travel, food, feelings, numbers, family and time.",
      },
      { property: "og:url", content: "https://lingua-pal-italian.lovable.app/learn" },
    ],
    links: [
      { rel: "canonical", href: "https://lingua-pal-italian.lovable.app/learn" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const { user, loading } = useAuth();
  const [learned, setLearned] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchLearnedWords(user.id).then((w) => setLearned(new Set(w.map((x) => x.word_it))));
    }
    setLastActivity({ to: "/learn", label: "Vocabulary decks" });
  }, [user]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-5 py-12">
        <p className="font-display text-3xl italic text-muted-foreground">Un momento…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <PageHeader title="Vocabulary" crumbs={[{ label: "Vocabulary" }]} />
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Vocabulary <em className="font-display italic text-primary">decks</em>
      </h1>
      <p className="mt-2 text-muted-foreground">Pick a topic. Flip cards, take the quiz, earn XP.</p>
      {!user && (
        <p className="mt-2 text-sm text-muted-foreground">
          Try any deck now. Sign in only when you want your learned words and XP saved.
        </p>
      )}

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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-3xl">{c.emoji}</div>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">{c.title}</h2>
                  <p className="text-sm text-muted-foreground">{c.blurb}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
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