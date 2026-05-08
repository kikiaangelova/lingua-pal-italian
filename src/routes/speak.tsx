import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Volume2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { speakIt } from "@/lib/speak";
import { VoicePicker } from "@/components/italian/VoicePicker";
import { categories } from "@/components/italian/data";
import { awardXp } from "@/lib/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/speak")({
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
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const allPhrases = categories.flatMap((c) => c.phrases);
  const [phrases] = useState(() => dailyPick(allPhrases, 5));
  const [i, setI] = useState(0);
  const [recordedUrls, setRecordedUrls] = useState<(string | null)[]>(() =>
    phrases.map(() => null),
  );
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [streamRef] = useState<{ stream: MediaStream | null }>({ stream: null });

  if (!user) return null;
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
    await awardXp(user.id, 5);
    toast.success("+5 XP", { duration: 1000 });
    if (i + 1 < phrases.length) setI(i + 1);
    else setI(0);
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Daily <em className="font-display italic text-primary">speaking</em>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Listen, repeat, then play yourself back. Mimic the rhythm.
      </p>

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
            onClick={() => speakIt(phrase.it)}
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

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Next phrase
        </button>
      </div>
    </main>
  );
}