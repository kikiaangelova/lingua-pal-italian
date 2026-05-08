// Italian TTS helpers with voice selection + cross-browser voice loading.

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

function doSpeak(text: string) {
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "it-IT";
  u.rate = 0.95;
  u.pitch = 1;
  const voice = pickVoice();
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  }
  synth.cancel();
  synth.speak(u);
}

export function speakIt(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!window.speechSynthesis.getVoices().length) {
    loadVoices().then(() => doSpeak(text));
    return;
  }
  doSpeak(text);
}
