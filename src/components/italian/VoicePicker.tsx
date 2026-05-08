import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  getItalianVoices,
  getSelectedVoiceURI,
  loadVoices,
  setSelectedVoiceURI,
  speakIt,
} from "@/lib/speak";

export function VoicePicker({ sample = "Ciao! Benvenuto. Sentiamo come suono." }: { sample?: string }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    loadVoices().then(() => {
      if (!mounted) return;
      const list = getItalianVoices();
      setVoices(list);
      const saved = getSelectedVoiceURI();
      const initial =
        (saved && list.find((v) => v.voiceURI === saved)?.voiceURI) ||
        list[0]?.voiceURI ||
        "";
      setSelected(initial);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!voices.length) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/60 p-3 text-xs text-muted-foreground">
        No Italian system voice detected. On iOS/macOS install an Italian voice in
        Settings &rarr; Accessibility &rarr; Spoken Content. On Chrome/Edge, Italian
        voices are usually built-in.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-2">
      <label className="px-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Voice
      </label>
      <select
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          setSelectedVoiceURI(e.target.value);
        }}
        className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
      >
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name} ({v.lang}){v.localService ? "" : " · cloud"}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => speakIt(sample)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
      >
        <Volume2 className="h-4 w-4" /> Test
      </button>
    </div>
  );
}
