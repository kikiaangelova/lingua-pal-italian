export type Question = {
  q: string;
  options: string[];
  answer: number; // index
  hint?: string;
};

export type Lesson = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  intro: string; // markdown
  examples: { it: string; en: string }[];
  questions: Question[];
};

export const lessons: Lesson[] = [
  {
    id: "alphabet",
    title: "L'alfabeto & i suoni",
    emoji: "🔤",
    blurb: "Vowels are pure, consonants are crisp",
    intro: `Italian has only **5 vowel sounds** — and they never change.\n\n- **a** as in *father*\n- **e** as in *bed* (or *they*)\n- **i** as in *machine*\n- **o** as in *more*\n- **u** as in *food*\n\nDouble consonants are pronounced **longer and stronger**: *pasta* vs *passa*. Most words stress the **second-to-last** syllable.`,
    examples: [
      { it: "casa", en: "house — KA-sa" },
      { it: "pizza", en: "pizza — PEET-tsa (double-z!)" },
      { it: "amore", en: "love — a-MO-re" },
    ],
    questions: [
      { q: "How many vowel sounds does Italian have?", options: ["3", "5", "7", "10"], answer: 1 },
      {
        q: "Where is the stress in 'amore'?",
        options: ["A-more", "a-MO-re", "amo-RE"],
        answer: 1,
      },
      {
        q: "How is 'pizza' pronounced?",
        options: ["PEE-zah", "PEET-tsa", "PIT-za"],
        answer: 1,
      },
      {
        q: "Italian 'i' sounds like the English…",
        options: ["i in 'sit'", "ee in 'see'", "y in 'fly'"],
        answer: 1,
      },
      {
        q: "Double consonants in Italian are…",
        options: ["silent", "longer & stronger", "pronounced once"],
        answer: 1,
      },
    ],
  },
  {
    id: "articles",
    title: "Gli articoli",
    emoji: "📰",
    blurb: "il, la, lo, i, le, gli",
    intro: `Italian uses **the** in 6 forms — pick by the noun's **gender** and the **first letter** of the next word.\n\n**Singular**\n- **il** — masculine, before most consonants: *il libro*\n- **lo** — masculine, before *s+consonant, z, gn, ps, y*: *lo zaino*, *lo studente*\n- **la** — feminine: *la casa*\n- **l'** — before any vowel: *l'amico, l'amica*\n\n**Plural**\n- **i** — plural of *il*: *i libri*\n- **gli** — plural of *lo* and *l'* (m): *gli studenti, gli amici*\n- **le** — plural of *la*: *le case*`,
    examples: [
      { it: "il caffè / i caffè", en: "the coffee / the coffees" },
      { it: "la pizza / le pizze", en: "the pizza / the pizzas" },
      { it: "lo studente / gli studenti", en: "the student / the students" },
    ],
    questions: [
      { q: "___ libro", options: ["il", "lo", "la"], answer: 0 },
      { q: "___ amica", options: ["il", "la", "l'"], answer: 2 },
      { q: "___ studente", options: ["il", "lo", "la"], answer: 1 },
      { q: "Plural of 'il ragazzo'?", options: ["i ragazzi", "gli ragazzi", "le ragazzi"], answer: 0 },
      { q: "Plural of 'lo zaino'?", options: ["i zaini", "gli zaini", "le zaini"], answer: 1 },
    ],
  },
  {
    id: "gender",
    title: "Maschile o femminile?",
    emoji: "⚖️",
    blurb: "Noun gender rules of thumb",
    intro: `Most Italian nouns end in **-o** (masculine) or **-a** (feminine).\n\n- **-o → -i** in plural: *libro → libri*\n- **-a → -e** in plural: *casa → case*\n- **-e** can be either gender, plural becomes **-i**: *cane → cani*, *chiave → chiavi*\n\nExceptions exist (*la mano*, *il problema*) — learn them as you go.`,
    examples: [
      { it: "un libro → due libri", en: "a book → two books (m)" },
      { it: "una casa → due case", en: "a house → two houses (f)" },
      { it: "un cane → due cani", en: "a dog → two dogs (m, ends -e)" },
    ],
    questions: [
      { q: "Plural of 'amico'", options: ["amici", "amice", "amicos"], answer: 0 },
      { q: "Plural of 'pizza'", options: ["pizzi", "pizze", "pizzas"], answer: 1 },
      { q: "Gender of 'casa'", options: ["masculine", "feminine"], answer: 1 },
      { q: "Plural of 'chiave' (key)", options: ["chiavi", "chiave", "chiaves"], answer: 0 },
      { q: "Most -o nouns are…", options: ["feminine", "masculine"], answer: 1 },
    ],
  },
  {
    id: "essere-avere",
    title: "Essere & Avere",
    emoji: "💫",
    blurb: "To be & to have",
    intro: `The two most important verbs.\n\n**Essere — to be**\n- io **sono** — I am\n- tu **sei** — you are\n- lui/lei **è** — he/she is\n- noi **siamo** — we are\n- voi **siete** — you all are\n- loro **sono** — they are\n\n**Avere — to have**\n- io **ho** — I have\n- tu **hai** — you have\n- lui/lei **ha** — he/she has\n- noi **abbiamo** — we have\n- voi **avete** — you all have\n- loro **hanno** — they have\n\n*Tip:* the **h** in 'ho, hai, ha, hanno' is silent — it just distinguishes the verb from other words.`,
    examples: [
      { it: "Io sono italiano.", en: "I am Italian." },
      { it: "Lei ha un cane.", en: "She has a dog." },
      { it: "Noi siamo amici.", en: "We are friends." },
    ],
    questions: [
      { q: "Io ___ stanco.", options: ["sono", "ho", "siamo"], answer: 0 },
      { q: "Tu ___ fame? (Are you hungry? — lit. have hunger)", options: ["sei", "hai", "ha"], answer: 1 },
      { q: "Lei ___ una sorella.", options: ["è", "ha", "sono"], answer: 1 },
      { q: "Noi ___ in Italia.", options: ["siamo", "abbiamo", "siete"], answer: 0 },
      { q: "Loro ___ felici.", options: ["hanno", "sono", "siete"], answer: 1 },
    ],
  },
  {
    id: "are-verbs",
    title: "Verbi in -are",
    emoji: "🎯",
    blurb: "Present tense of regular -are verbs",
    intro: `Most Italian verbs end in **-are**, **-ere**, or **-ire**. Today: regular **-are**.\n\nDrop **-are**, add the ending. Example with **parlare** (to speak):\n\n- io parl**o** — I speak\n- tu parl**i** — you speak\n- lui/lei parl**a** — he/she speaks\n- noi parl**iamo** — we speak\n- voi parl**ate** — you all speak\n- loro parl**ano** — they speak\n\nWorks the same for: *mangiare* (to eat), *amare* (to love), *abitare* (to live), *guardare* (to watch).`,
    examples: [
      { it: "Io parlo italiano.", en: "I speak Italian." },
      { it: "Tu mangi la pizza.", en: "You eat pizza." },
      { it: "Noi abitiamo a Roma.", en: "We live in Rome." },
    ],
    questions: [
      { q: "Io ___ (mangiare) la pasta.", options: ["mangia", "mangio", "mangi"], answer: 1 },
      { q: "Tu ___ (parlare) inglese.", options: ["parli", "parla", "parlo"], answer: 0 },
      { q: "Noi ___ (abitare) a Milano.", options: ["abitate", "abitiamo", "abitano"], answer: 1 },
      { q: "Loro ___ (amare) la musica.", options: ["amano", "amate", "amiamo"], answer: 0 },
      { q: "Voi ___ (guardare) il film.", options: ["guardano", "guardiamo", "guardate"], answer: 2 },
    ],
  },
  {
    id: "questions",
    title: "Fare domande",
    emoji: "❓",
    blurb: "Asking simple questions",
    intro: `Good news: in Italian you can ask a question by **just raising your tone** at the end of a sentence — no word order change needed.\n\n*Tu parli inglese.* → *Tu parli inglese?*\n\n**Question words:**\n- **Chi?** — Who?\n- **Cosa?** / **Che cosa?** — What?\n- **Dove?** — Where?\n- **Quando?** — When?\n- **Perché?** — Why? / Because\n- **Come?** — How?\n- **Quanto?** — How much?`,
    examples: [
      { it: "Come ti chiami?", en: "What's your name?" },
      { it: "Dove abiti?", en: "Where do you live?" },
      { it: "Quanto costa?", en: "How much does it cost?" },
    ],
    questions: [
      { q: "'Where' in Italian", options: ["Quando", "Dove", "Come"], answer: 1 },
      { q: "'Why' in Italian", options: ["Perché", "Cosa", "Chi"], answer: 0 },
      { q: "'How much?'", options: ["Come?", "Quanto?", "Quando?"], answer: 1 },
      { q: "Translate: 'Who is it?'", options: ["Cosa è?", "Chi è?", "Dove è?"], answer: 1 },
      { q: "Italian questions need…", options: ["different word order", "just rising tone", "an extra word"], answer: 1 },
    ],
  },
];

export function lessonById(id: string) {
  return lessons.find((l) => l.id === id);
}