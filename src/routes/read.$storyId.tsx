import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Volume2, Sparkles, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { storyById } from "@/components/italian/stories";
import { speakIt } from "@/lib/speak";
import { awardXp, completeStory } from "@/lib/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/read/$storyId")({
  component: StoryPage,
});

function StoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { storyId } = Route.useParams();
  const story = storyById(storyId);
  const [showQuiz, setShowQuiz] = useState(false);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (!story) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <p>Story not found.</p>
        <Link to="/read" className="text-primary underline">Back</Link>
      </main>
    );
  }
  if (!user) return null;

  const finish = async (final: number) => {
    await completeStory(user.id, story.id);
    await awardXp(user.id, 10 + final * 5);
    setDone(true);
  };

  if (done) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <div
          className="rounded-3xl border border-border/60 bg-card p-8 text-center"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-3 font-display text-3xl font-semibold">Storia finita!</h3>
          <p className="mt-1 text-muted-foreground">
            {score} / {story.questions.length} comprehension · +{10 + score * 5} XP
          </p>
          <Link
            to="/read"
            className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            More stories
          </Link>
        </div>
      </main>
    );
  }

  if (showQuiz) {
    const q = story.questions[qi];
    const onPick = (idx: number) => {
      if (picked !== null) return;
      setPicked(idx);
      const ok = idx === q.answer;
      if (ok) {
        setScore((s) => s + 1);
        toast.success("Sì!", { duration: 700 });
      }
      setTimeout(() => {
        if (qi + 1 >= story.questions.length) {
          finish(score + (ok ? 1 : 0));
        } else {
          setQi(qi + 1);
          setPicked(null);
        }
      }, 800);
    };
    return (
      <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Comprehension · {qi + 1} / {story.questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div
          className="mt-3 rounded-3xl border border-border/60 bg-card p-8 text-center"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{q.q}</h2>
        </div>
        <div className="mt-4 grid gap-2">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.answer;
            const isPicked = idx === picked;
            let cls = "border-border bg-card hover:border-primary/40";
            if (picked !== null) {
              if (isCorrect) cls = "border-secondary bg-secondary/10";
              else if (isPicked) cls = "border-destructive bg-destructive/10";
              else cls = "border-border bg-card opacity-60";
            }
            return (
              <button
                key={idx}
                onClick={() => onPick(idx)}
                disabled={picked !== null}
                className={
                  "flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-base text-foreground transition " +
                  cls
                }
              >
                <span>{opt}</span>
                {picked !== null && isCorrect && <Check className="h-5 w-5 text-secondary" />}
                {picked !== null && isPicked && !isCorrect && <X className="h-5 w-5 text-destructive" />}
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  // glossary lookup map
  const glossMap = new Map(story.glossary.map((g) => [g.it.toLowerCase(), g.en]));

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <Link to="/read" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Stories
      </Link>
      <header className="mt-3">
        <div className="text-3xl">{story.emoji}</div>
        <h1 className="mt-1 text-4xl font-semibold text-foreground sm:text-5xl">{story.title}</h1>
        <p className="text-muted-foreground">{story.blurb} · <span className="font-mono text-xs">{story.level}</span></p>
      </header>

      <article
        className="mt-6 space-y-4 rounded-3xl border border-border/60 bg-card p-6"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        {story.sentences.map((s, idx) => (
          <SentenceLine key={idx} it={s.it} en={s.en} glossMap={glossMap} />
        ))}
      </article>

      <section className="mt-6">
        <h3 className="font-display text-lg font-semibold">Vocabolario</h3>
        <ul className="mt-2 grid gap-1 text-sm">
          {story.glossary.map((g) => (
            <li key={g.it} className="flex justify-between border-b border-border/60 py-1">
              <span className="font-display font-semibold text-foreground">{g.it}</span>
              <span className="text-muted-foreground">{g.en}</span>
            </li>
          ))}
        </ul>
      </section>

      <button
        onClick={() => setShowQuiz(true)}
        className="mt-8 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        style={{ boxShadow: "var(--shadow-warm)" }}
      >
        Comprehension check
      </button>
    </main>
  );
}

function SentenceLine({
  it,
  en,
  glossMap,
}: {
  it: string;
  en: string;
  glossMap: Map<string, string>;
}) {
  const [show, setShow] = useState(false);
  const [tappedWord, setTappedWord] = useState<string | null>(null);

  const tokens = it.split(/(\s+)/);

  return (
    <div className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
      <p className="font-display text-xl leading-relaxed text-foreground">
        {tokens.map((t, i) => {
          if (/^\s+$/.test(t)) return <span key={i}>{t}</span>;
          const clean = t.replace(/[.,!?;:«»]/g, "").toLowerCase();
          const trans = glossMap.get(clean);
          return (
            <button
              key={i}
              onClick={() => {
                speakIt(t);
                setTappedWord(trans ? `${t} — ${trans}` : t);
                setTimeout(() => setTappedWord(null), 1800);
              }}
              className={
                "rounded transition hover:bg-accent/50 " +
                (trans ? "underline decoration-primary/40 decoration-dotted underline-offset-4" : "")
              }
            >
              {t}
            </button>
          );
        })}
        <button
          onClick={() => speakIt(it)}
          className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background align-middle text-foreground hover:bg-muted"
          aria-label="Listen"
        >
          <Volume2 className="h-3 w-3" />
        </button>
      </p>
      {tappedWord && <p className="mt-1 text-xs italic text-primary">{tappedWord}</p>}
      <button
        onClick={() => setShow((s) => !s)}
        className="mt-1 text-xs text-muted-foreground hover:text-foreground"
      >
        {show ? "Hide" : "Show"} translation
      </button>
      {show && <p className="mt-1 text-sm text-muted-foreground">{en}</p>}
    </div>
  );
}