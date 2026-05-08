// Pick a real Italian voice when available — otherwise the browser
// happily speaks Italian text with an English engine, which sounds wrong.

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickItalianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer it-IT, then any it-*, then names containing "Ital"
  const v =
    voices.find((v) => v.lang === "it-IT") ||
    voices.find((v) => v.lang?.toLowerCase().startsWith("it")) ||
    voices.find((v) => /ital/i.test(v.name));
  cachedVoice = v ?? null;
  return cachedVoice;
}

function speakNow(text: string) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "it-IT";
  u.rate = 0.9;
  const voice = pickItalianVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function speakIt(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Voices load async on most browsers (especially Chrome). If the list is
  // empty, wait for voiceschanged once and retry.
  if (!window.speechSynthesis.getVoices().length) {
    let done = false;
    const handler = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      cachedVoice = null;
      speakNow(text);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    window.speechSynthesis.getVoices();
    // Safety fallback if voiceschanged never fires
    setTimeout(() => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      speakNow(text);
    }, 500);
    return;
  }
  speakNow(text);
}