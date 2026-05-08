import { useState } from "react";
import { Sparkles, Volume2, BookOpen } from "lucide-react";
import { categories, wordOfDay } from "./data";
import { Flashcard } from "./Flashcard";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "it-IT";
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function ItalianApp() {
  const [activeId, setActiveId] = useState(categories[0].id);
  const active = categories.find((c) => c.id === activeId)!;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      {/* Header */}
      <header className="flex flex-col items-start gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" /> Impara l'italiano
        </span>
        <h1 className="text-5xl font-semibold leading-[1.05] text-foreground sm:text-7xl">
          Ciao, <em className="font-display italic text-primary">bello.</em>
          <br />
          Let's learn Italian.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          A slow, beautiful way to pick up everyday Italian — one phrase, one sip of espresso at a time.
        </p>
      </header>

      {/* Word of the day */}
      <section
        className="mt-10 overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-8"
        style={{ background: "var(--gradient-soft)", boxShadow: "var(--shadow-soft)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Frase del giorno
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              {wordOfDay.it}
            </h2>
            <p className="mt-1 text-muted-foreground">
              <span className="italic">/{wordOfDay.pron}/</span> — {wordOfDay.en}
            </p>
          </div>
          <button
            onClick={() => speak(wordOfDay.it)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <Volume2 className="h-4 w-4" /> Ascolta
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" /> Choose a topic
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition " +
                  (isActive
                    ? "border-transparent bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:bg-muted")
                }
              >
                <span>{c.emoji}</span>
                <span>{c.title}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm italic text-muted-foreground">{active.blurb}</p>
      </section>

      {/* Flashcards */}
      <section className="mt-8">
        <Flashcard phrases={active.phrases} categoryTitle={active.title} />
      </section>

      {/* Phrase list */}
      <section className="mt-14">
        <h3 className="mb-4 text-2xl font-semibold text-foreground">All phrases in {active.title}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {active.phrases.map((p) => (
            <li
              key={p.it}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div>
                <p className="font-display text-lg font-semibold text-foreground">{p.it}</p>
                <p className="text-sm text-muted-foreground">
                  {p.en} <span className="italic opacity-70">/{p.pron}/</span>
                </p>
              </div>
              <button
                onClick={() => speak(p.it)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-muted"
                aria-label={`Listen to ${p.it}`}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-20 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
        Fatto con <span className="text-primary">♥</span> — a presto!
      </footer>
    </main>
  );
}