import { useState, useEffect } from "react";
import { Volume2, RotateCw, ArrowRight, ArrowLeft, Check, X, Loader2 } from "lucide-react";
import type { Phrase } from "./data";
import { speakIt } from "@/lib/speak";
import { toast } from "sonner";

type Props = { phrases: Phrase[]; categoryTitle: string };

export function Flashcard({ phrases, categoryTitle }: Props) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [review, setReview] = useState<number[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setI(0);
    setFlipped(false);
    setKnown(new Set());
    setReview([]);
  }, [categoryTitle]);

  const phrase = phrases[i];
  const next = () => {
    setFlipped(false);
    setI((i + 1) % phrases.length);
  };
  const prev = () => {
    setFlipped(false);
    setI((i - 1 + phrases.length) % phrases.length);
  };
  const markKnown = () => {
    setKnown((s) => new Set(s).add(i));
    setTimeout(next, 200);
  };
  const markUnknown = () => {
    setReview((r) => (r.includes(i) ? r : [...r, i]));
    setFlipped(true);
    // Auto-listen so they hear it before moving on, then advance
    void handleListen();
    setTimeout(next, 1400);
  };
  const handleListen = async () => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const res = await speakIt(phrase.it);
      if (!res.ok) {
        toast.error("Audio unavailable", { description: res.message });
      }
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
        <span className="font-display text-lg italic text-foreground/70">{categoryTitle}</span>
        <span>
          {i + 1} / {phrases.length} · {known.size} learned · {review.length} to review
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        className="group relative h-72 w-full max-w-xl cursor-pointer [perspective:1200px]"
        aria-label="Flip card"
      >
        <div
          className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/60 bg-card p-8 [backface-visibility:hidden]"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Italiano</span>
            <h2 className="text-center text-5xl font-semibold text-foreground sm:text-6xl">
              {phrase.it}
            </h2>
            <p className="text-sm italic text-muted-foreground">/{phrase.pron}/</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <RotateCw className="h-3 w-3" /> tap to reveal
            </span>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl p-8 text-primary-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-warm)" }}
          >
            <span className="text-xs uppercase tracking-[0.3em] opacity-80">English</span>
            <h2 className="text-center text-4xl font-semibold sm:text-5xl">{phrase.en}</h2>
            <p className="text-sm italic opacity-80">{phrase.it}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={prev}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
          aria-label="Previous"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            void handleListen();
          }}
          disabled={speaking}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
        >
          {speaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />} Listen
        </button>
        <button
          onClick={markUnknown}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          <X className="h-4 w-4" /> I don't know
        </button>
        <button
          onClick={markKnown}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-secondary px-5 text-sm font-medium text-secondary-foreground transition hover:opacity-90"
        >
          <Check className="h-4 w-4" /> I know it
        </button>
        <button
          onClick={next}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
          aria-label="Next"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}