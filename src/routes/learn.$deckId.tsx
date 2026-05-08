import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, X, Volume2, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { deckById } from "@/components/italian/data";
import { Flashcard } from "@/components/italian/Flashcard";
import { speakIt } from "@/lib/speak";
import { awardXp, markWordLearned } from "@/lib/progress";
import { setLastActivity } from "@/lib/last-activity";
import { toast } from "sonner";

export const Route = createFileRoute("/learn/$deckId")({
  component: DeckPage,
});

function DeckPage() {
  const { user, loading } = useAuth();
  const { deckId } = Route.useParams();
  const deck = deckById(deckId);
  const [mode, setMode] = useState<"cards" | "quiz">("cards");

  useEffect(() => {
    if (user) setLastActivity({ to: `/learn/${deckId}`, label: `${deck?.title ?? "Vocabulary"} deck` });
  }, [user, deckId, deck]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-5 py-12">
        <p className="font-display text-3xl italic text-muted-foreground">Un momento…</p>
      </main>
    );
  }

  if (!deck) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <p>Deck not found.</p>
        <Link to="/learn" className="text-primary underline">Back</Link>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All decks
      </Link>
      <header className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl">{deck.emoji}</div>
          <h1 className="mt-1 text-4xl font-semibold text-foreground">{deck.title}</h1>
          <p className="text-muted-foreground">{deck.blurb}</p>
          {!user && (
            <p className="mt-2 text-sm text-muted-foreground">
              Guest mode lets you practice freely. Sign in when you want to save learned words and Luca-style coaching over time.
            </p>
          )}
        </div>
        <div className="flex rounded-full bg-muted p-1 text-sm font-medium">
          {(["cards", "quiz"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                "rounded-full px-4 py-1.5 transition " +
                (mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")
              }
            >
              {m === "cards" ? "Cards" : "Quiz"}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-8">
        {mode === "cards" ? (
          <Flashcard phrases={deck.phrases} categoryTitle={deck.title} />
        ) : (
          <Quiz deck={deck} userId={user?.id ?? null} />
        )}
      </div>
    </main>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Quiz({
  deck,
  userId,
}: {
  deck: ReturnType<typeof deckById> & {};
  userId: string | null;
}) {
  const questions = useMemo(() => {
    return shuffle(deck!.phrases).map((p) => {
      const wrong = shuffle(deck!.phrases.filter((x) => x.en !== p.en))
        .slice(0, 3)
        .map((x) => x.en);
      const opts = shuffle([p.en, ...wrong]);
      return { phrase: p, options: opts, correct: p.en };
    });
  }, [deck]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div
        className="rounded-3xl border border-border/60 bg-card p-8 text-center"
        style={{ boxShadow: "var(--shadow-warm)" }}
      >
        <Sparkles className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-3 font-display text-3xl font-semibold">Bravissimo!</h3>
        <p className="mt-1 text-muted-foreground">
          You got <span className="font-semibold text-foreground">{score}</span> /{" "}
          {questions.length} correct.
        </p>
        <p className="mt-1 text-sm text-primary">+{score * 10} XP earned</p>
        {!userId && (
          <Link
            to="/login"
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            Sign in to save these words <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <button
          onClick={() => {
            setI(0);
            setScore(0);
            setPicked(null);
            setDone(false);
          }}
          className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          Play again
        </button>
      </div>
    );
  }

  const q = questions[i];

  const onPick = async (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const ok = opt === q.correct;
    if (ok) {
      setScore((s) => s + 1);
      if (userId) {
        await markWordLearned(userId, deck!.id, q.phrase.it);
        await awardXp(userId, 10);
        toast.success("+10 XP", { duration: 1200 });
      } else {
        toast.success("Correct!", { duration: 1200 });
      }
    }
    setTimeout(() => {
      if (i + 1 >= questions.length) setDone(true);
      else {
        setI(i + 1);
        setPicked(null);
      }
    }, 900);
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {i + 1} / {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      <div
        className="mt-3 rounded-3xl border border-border/60 bg-card p-8 text-center"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">What does this mean?</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-foreground">{q.phrase.it}</h2>
        <button
          onClick={() => speakIt(q.phrase.it)}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-foreground hover:bg-muted"
        >
          <Volume2 className="h-3 w-3" /> Listen
        </button>
      </div>
      <div className="mt-4 grid gap-2">
        {q.options.map((opt) => {
          const isCorrect = opt === q.correct;
          const isPicked = opt === picked;
          let cls = "border-border bg-card hover:border-primary/40";
          if (picked) {
            if (isCorrect) cls = "border-secondary bg-secondary/10";
            else if (isPicked) cls = "border-destructive bg-destructive/10";
            else cls = "border-border bg-card opacity-60";
          }
          return (
            <button
              key={opt}
              onClick={() => onPick(opt)}
              disabled={!!picked}
              className={
                "flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-base text-foreground transition " +
                cls
              }
            >
              <span>{opt}</span>
              {picked && isCorrect && <Check className="h-5 w-5 text-secondary" />}
              {picked && isPicked && !isCorrect && <X className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}