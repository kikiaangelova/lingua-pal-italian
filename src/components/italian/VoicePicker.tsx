import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { speakIt } from "@/lib/speak";
import { toast } from "sonner";

export function VoicePicker({ sample = "Ciao! Benvenuto in Italia." }: { sample?: string }) {
  const [busy, setBusy] = useState(false);
  const test = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await speakIt(sample);
      if (!r.ok) toast.error(r.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card/60 p-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Italian audio
        </p>
        <p className="mt-0.5 truncate text-sm text-foreground">Tap once and hear Italian immediately.</p>
      </div>
      <button
        type="button"
        onClick={test}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />} Play sample
      </button>
    </div>
  );
}
