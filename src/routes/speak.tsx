import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Volume2, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { speakIt } from "@/lib/speak";
import { VoicePicker } from "@/components/italian/VoicePicker";
import { categories } from "@/components/italian/data";
import { awardXp } from "@/lib/progress";
import { toast } from "sonner";
import { PageHeader } from "@/components/italian/PageHeader";
import { setLastActivity } from "@/lib/last-activity";

export const Route = createFileRoute("/speak")({
  head: () => ({
    meta: [
      { title: "Speaking practice — Ciao" },
      {
        name: "description",
        content:
          "Hear native Italian and repeat it now — daily speaking warm-ups with native voices, recording and instant playback.",
      },
      { property: "og:title", content: "Speaking practice — Ciao" },
      {
        property: "og:description",
        content:
          "Hear native Italian and repeat it now — daily speaking warm-ups with native voices, recording and instant playback.",
      },
      { property: "og:url", content: "https://tryitalian.com/speak" },
    ],
    links: [
      { rel: "canonical", href: "https://tryitalian.com/speak" },
    ],
  }),
  component: SpeakPage,
});

function dailyPick<T>(arr: T[], n: number): T[] {
  // pseudo-random based on date so the warm-up is stable for the day
  const seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < Math.min(n, arr.length)) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * arr.length);
    if (!used.has(idx)) {
      used.add(idx);
      out.push(arr[idx]);
    }
  }
  return out;
}

function SpeakPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) setLastActivity({ to: "/speak", label: "Speaking practice" });
  }, [user]);

  const allPhrases = categories.flatMap((c) => c.phrases);
  const [phrases] = useState(() => dailyPick(allPhrases, 5));
  const [i, setI] = useState(0);
  const [recordedUrls, setRecordedUrls] = useState<(string | null)[]>(() =>
    phrases.map(() => null),
  );
  const [recording, setRecording] = useState(false);
  const [audioState, setAudioState] = useState<{
    type: "idle" | "ready" | "playing" | "error";
    message: string;
  }>({ type: "ready", message: "Tap Native to hear a native Italian voice." });
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [streamRef] = useState<{ stream: MediaStream | null }>({ stream: null });


  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-5 py-12">
        <p className="font-display text-3xl italic text-muted-foreground">Un momento…</p>
      </main>
    );
  }

  const phrase = phrases[i];

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.stream = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrls((prev) => {
          const copy = [...prev];
          copy[i] = url;
          return copy;
        });
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone not available");
    }
  };

  const stopRec = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const next = async () => {
    if (user) {
      await awardXp(user.id, 5);
      toast.success("+5 XP", { duration: 1000 });
    } else {
      toast.success("Great repetition", { duration: 1000 });
    }
    if (i + 1 < phrases.length) setI(i + 1);
    else setI(0);
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <PageHeader title="Speaking" crumbs={[{ label: "Speaking" }]} />
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Daily <em className="font-display italic text-primary">speaking</em>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Listen, repeat, then play yourself back. Mimic the rhythm.
      </p>
      {!user && (
        <p className="mt-2 text-sm text-muted-foreground">
          You can practice speaking right away. Sign in when you want your effort counted in progress.
        </p>
      )}

      <div className="mt-4 text-sm text-muted-foreground">Phrase {i + 1} / {phrases.length}</div>

      <div className="mt-3">
        <VoicePicker sample={phrase.it} />
      </div>

      <section
        className="mt-3 rounded-3xl border border-border/60 bg-card p-8 text-center"
        style={{ boxShadow: "var(--shadow-warm)" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Repeat after me</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">
          {phrase.it}
        </h2>
        <p className="mt-2 italic text-muted-foreground">/{phrase.pron}/</p>
        <p className="mt-1 text-sm text-muted-foreground">{phrase.en}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={async () => {
              setAudioState({ type: "playing", message: "Playing Italian audio…" });
              const result = await speakIt(phrase.it);
              if (result.ok) {
                setAudioState({
                  type: "ready",
                  message: `Now copy the rhythm${result.voiceName ? ` · ${result.voiceName}` : ""}.`,
                });
              } else {
                setAudioState({ type: "error", message: result.message });
                toast.error(result.message);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Volume2 className="h-4 w-4" /> Native
          </button>
          {!recording ? (
            <button
              onClick={startRec}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              <Mic className="h-4 w-4" /> Record me
            </button>
          ) : (
            <button
              onClick={stopRec}
              className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-medium text-destructive-foreground"
            >
              <Square className="h-4 w-4" /> Stop
            </button>
          )}
          {recordedUrls[i] && (
            <button
              onClick={() => {
                const a = new Audio(recordedUrls[i]!);
                a.play();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:opacity-90"
            >
              <Play className="h-4 w-4" /> Play me
            </button>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border/60 bg-card/80 p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {audioState.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Audio coach</p>
            <p className="mt-1 text-sm text-foreground">{audioState.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Listen once. Repeat aloud. Record yourself. Then compare the melody, not just the words.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <div className="flex flex-wrap items-center justify-end gap-3">
          {!user && (
            <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Save my practice <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" /> Next phrase
          </button>
        </div>
      </div>
    </main>
  );
}