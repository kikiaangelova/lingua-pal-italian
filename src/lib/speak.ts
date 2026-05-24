// Italian TTS helpers with voice selection + cross-browser voice loading.

export type SpeakResult =
  | { ok: true; voiceName?: string; voiceLang?: string }
  | { ok: false; reason: "unsupported" | "no-voices" | "blocked" | "error"; message: string };

const STORAGE_KEY = "it_voice_uri";

function rankVoice(v: SpeechSynthesisVoice): number {
  // Higher = better. Prefer it-IT, then known high-quality engines.
  let score = 0;
  if (v.lang === "it-IT") score += 100;
  else if (v.lang?.toLowerCase().startsWith("it")) score += 60;
  const n = v.name.toLowerCase();
  if (/google/.test(n)) score += 40;          // Chrome/Android natural voices
  if (/(microsoft|natural|online)/.test(n)) score += 35; // Edge online neural
  if (/(alice|luca|federica|paola|tessa)/.test(n)) score += 25; // Apple it
  if (/premium|enhanced|neural/.test(n)) score += 20;
  if (v.localService === false) score += 10;  // cloud voices usually better
  return score;
}

export function getItalianVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang?.toLowerCase().startsWith("it"))
    .sort((a, b) => rankVoice(b) - rankVoice(a));
}

export function getSelectedVoiceURI(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setSelectedVoiceURI(uri: string | null) {
  if (typeof window === "undefined") return;
  if (uri) window.localStorage.setItem(STORAGE_KEY, uri);
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) {
      resolve(existing);
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = finish;
    // Safari sometimes needs a kick
    window.speechSynthesis.getVoices();
    setTimeout(finish, 800);
  });
}

function pickVoice(): SpeechSynthesisVoice | null {
  const italians = getItalianVoices();
  if (!italians.length) return null;
  const saved = getSelectedVoiceURI();
  if (saved) {
    const found = italians.find((v) => v.voiceURI === saved);
    if (found) return found;
  }
  return italians[0]; // best ranked
}

async function doSpeak(text: string): Promise<SpeakResult> {
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "it-IT";
  u.rate = 0.95;
  u.pitch = 1;
  const voice = pickVoice();
  if (!voice) {
    return {
      ok: false,
      reason: "no-voices",
      message: "No Italian voice is available on this device yet.",
    };
  }
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  }
  return await new Promise<SpeakResult>((resolve) => {
    let settled = false;
    const finish = (result: SpeakResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    u.onstart = () => finish({ ok: true, voiceName: voice.name, voiceLang: voice.lang });
    u.onerror = () => {
      finish({
        ok: false,
        reason: "blocked",
        message: "Audio playback was blocked. Tap again after interacting with the page.",
      });
    };

    try {
      synth.cancel();
      synth.speak(u);
      window.setTimeout(() => {
        if (!settled) {
          finish({ ok: true, voiceName: voice.name, voiceLang: voice.lang });
        }
      }, 250);
    } catch {
      finish({
        ok: false,
        reason: "error",
        message: "Italian audio could not start on this device.",
      });
    }
  });
}

export async function speakIt(text: string): Promise<SpeakResult> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return {
      ok: false,
      reason: "unsupported",
      message: "Speech is not supported in this browser.",
    };
  }
  // 1) Try server-side neural Italian voice (ElevenLabs).
  try {
    const r = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (r.ok) {
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      try {
        await audio.play();
        audio.onended = () => URL.revokeObjectURL(url);
        return { ok: true, voiceName: "Neural Italian", voiceLang: "it-IT" };
      } catch {
        URL.revokeObjectURL(url);
        return {
          ok: false,
          reason: "blocked",
          message: "Tap again — your browser blocked autoplay until you interact.",
        };
      }
    }
    // 503 = not configured → fall through to browser TTS silently
  } catch {
    // network error → fall through
  }

  // 2) Fallback to browser speech synthesis.
  if (!window.speechSynthesis.getVoices().length) {
    await loadVoices();
  }
  return doSpeak(text);
}
