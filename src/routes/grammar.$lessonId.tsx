import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Check, X, Sparkles, Volume2, ArrowRight, Loader2, Link2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { lessonById } from "@/components/italian/lessons";
import { awardXp, completeLesson } from "@/lib/progress";
import { speakIt } from "@/lib/speak";
import { toast } from "sonner";

export const Route = createFileRoute("/grammar/$lessonId")({
  head: ({ params }) => {
    const lesson = lessonById(params.lessonId);
    const title = lesson ? `${lesson.title} — Italian grammar lesson` : "Italian grammar lesson — Ciao";
    const description = lesson
      ? `${lesson.title}: ${lesson.blurb}. Learn, see examples, then take a short quiz to lock it in.`
      : "Italian grammar lesson with examples and a short quiz.";
    const url = `https://tryitalian.com/grammar/${params.lessonId}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: lesson
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Course",
                name: lesson.title,
                description: lesson.blurb,
                inLanguage: "it",
                educationalLevel: "Beginner",
                provider: {
                  "@type": "Organization",
                  name: "Ciao",
                  url: "https://tryitalian.com",
                },
                hasCourseInstance: {
                  "@type": "CourseInstance",
                  courseMode: "online",
                  inLanguage: "it",
                },
              }),
            },
          ]
        : undefined,
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { user, loading } = useAuth();
  const { lessonId } = Route.useParams();
  const lesson = lessonById(lessonId);

  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-5 py-12">
        <p className="font-display text-3xl italic text-muted-foreground">Un momento…</p>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <p>Lesson not found.</p>
        <Link to="/grammar" className="text-primary underline">Back</Link>
      </main>
    );
  }
  const finishLesson = async (finalScore: number) => {
    if (user) {
      setSaving(true);
      try {
        await completeLesson(user.id, lesson.id, finalScore);
        await awardXp(user.id, finalScore * 5);
      } finally {
        setSaving(false);
      }
    }
    setPhase("done");
  };

  const copyDeepLink = () => {
    const url = `${window.location.origin}/grammar/${lesson!.id}`;
    navigator.clipboard?.writeText(url);
    toast.success("Lesson link copied");
  };

  if (phase === "done") {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="sr-only">{lesson.title} — lesson complete</h1>
        <div
          className="rounded-3xl border border-border/60 bg-card p-8 text-center"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          {saving ? (
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          ) : (
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
          )}
          <h2 className="mt-3 font-display text-3xl font-semibold">Bravo!</h2>
          <p className="mt-1 text-muted-foreground">
            {score} / {lesson.questions.length} correct
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {user
              ? saving
                ? "Saving to your journey…"
                : `Saved to your journey · +${score * 5} XP`
              : "Nice work. Sign in to save this lesson and keep Luca updated on what you need next."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to={user ? "/grammar" : "/login"}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              {user ? "Back to lessons" : "Sign in to save progress"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={copyDeepLink}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Link2 className="h-4 w-4" /> Share lesson
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "learn") {
    return (
      <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
        <Link to="/grammar" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Lessons
        </Link>
        <header className="mt-3">
          <div className="text-3xl">{lesson.emoji}</div>
          <h1 className="mt-1 text-4xl font-semibold text-foreground sm:text-5xl">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.blurb}</p>
        </header>

        <article
          className="prose prose-sm mt-6 max-w-none rounded-3xl border border-border/60 bg-card p-6 text-foreground"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <ReactMarkdown>{lesson.intro}</ReactMarkdown>
        </article>

        <section className="mt-6">
          <h2 className="font-display text-xl font-semibold">Examples</h2>
          {!user && (
            <p className="mt-2 text-sm text-muted-foreground">
              You can try this lesson without an account. When you sign in, completed quizzes update your journey map and Luca remembers what needs work.
            </p>
          )}
          <ul className="mt-3 grid gap-2">
            {lesson.examples.map((ex) => (
              <li
                key={ex.it}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">{ex.it}</p>
                  <p className="text-sm text-muted-foreground">{ex.en}</p>
                </div>
                <button
                  onClick={() => speakIt(ex.it)}
                  aria-label={`Listen to ${ex.it}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <button
          onClick={() => setPhase("quiz")}
          className="mt-8 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          I'm ready — start the check
        </button>
      </main>
    );
  }

  // quiz
  const q = lesson.questions[qi];
  const onPick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const ok = idx === q.answer;
    if (ok) {
      setScore((s) => s + 1);
      toast.success("Correct!", { duration: 800 });
    }
    setTimeout(() => {
      if (qi + 1 >= lesson.questions.length) {
        finishLesson(score + (ok ? 1 : 0));
      } else {
        setQi(qi + 1);
        setPicked(null);
      }
    }, 800);
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <h1 className="sr-only">{lesson.title} — quiz</h1>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Check · {qi + 1} / {lesson.questions.length}</span>
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