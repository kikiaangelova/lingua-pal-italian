export type StoryWord = { it: string; en: string };
export type StorySentence = { it: string; en: string };

export type Story = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  level: "A0" | "A1";
  sentences: StorySentence[];
  glossary: StoryWord[];
  questions: { q: string; options: string[]; answer: number }[];
};

export const stories: Story[] = [
  {
    id: "mattina-roma",
    title: "Una mattina a Roma",
    emoji: "☀️",
    blurb: "A morning in Rome",
    level: "A0",
    sentences: [
      { it: "Mi chiamo Luca.", en: "My name is Luca." },
      { it: "Abito a Roma.", en: "I live in Rome." },
      { it: "La mattina, bevo un caffè.", en: "In the morning, I drink a coffee." },
      { it: "Poi vado al lavoro in bicicletta.", en: "Then I go to work by bike." },
      { it: "Roma è bellissima!", en: "Rome is beautiful!" },
    ],
    glossary: [
      { it: "mi chiamo", en: "my name is" },
      { it: "abito", en: "I live" },
      { it: "bevo", en: "I drink" },
      { it: "vado", en: "I go" },
      { it: "bellissima", en: "very beautiful" },
    ],
    questions: [
      { q: "Where does Luca live?", options: ["Milan", "Rome", "Naples"], answer: 1 },
      { q: "What does he drink in the morning?", options: ["tea", "water", "coffee"], answer: 2 },
      { q: "How does he go to work?", options: ["car", "bike", "bus"], answer: 1 },
    ],
  },
  {
    id: "al-mercato",
    title: "Al mercato",
    emoji: "🍅",
    blurb: "At the market",
    level: "A0",
    sentences: [
      { it: "Oggi vado al mercato.", en: "Today I'm going to the market." },
      { it: "Compro pomodori e pane.", en: "I buy tomatoes and bread." },
      { it: "Il pane è caldo e profumato.", en: "The bread is warm and fragrant." },
      { it: "Il signore dice: «Buongiorno, signora!»", en: "The man says: 'Good morning, ma'am!'" },
      { it: "Pago dieci euro. Grazie!", en: "I pay ten euros. Thank you!" },
    ],
    glossary: [
      { it: "compro", en: "I buy" },
      { it: "pomodori", en: "tomatoes" },
      { it: "pane", en: "bread" },
      { it: "caldo", en: "warm" },
      { it: "pago", en: "I pay" },
    ],
    questions: [
      { q: "What does she buy?", options: ["pasta and wine", "tomatoes and bread", "cheese only"], answer: 1 },
      { q: "How is the bread?", options: ["cold", "old", "warm"], answer: 2 },
      { q: "How much does she pay?", options: ["5€", "10€", "20€"], answer: 1 },
    ],
  },
  {
    id: "in-spiaggia",
    title: "Una giornata in spiaggia",
    emoji: "🏖️",
    blurb: "A day at the beach",
    level: "A1",
    sentences: [
      { it: "Fa caldo. Andiamo al mare!", en: "It's hot. Let's go to the sea!" },
      { it: "Maria porta l'ombrellone.", en: "Maria brings the beach umbrella." },
      { it: "I bambini giocano nella sabbia.", en: "The children play in the sand." },
      { it: "A pranzo mangiamo un panino.", en: "For lunch we eat a sandwich." },
      { it: "Il sole tramonta lentamente.", en: "The sun sets slowly." },
    ],
    glossary: [
      { it: "caldo", en: "hot" },
      { it: "ombrellone", en: "beach umbrella" },
      { it: "sabbia", en: "sand" },
      { it: "panino", en: "sandwich" },
      { it: "tramonta", en: "sets (sun)" },
    ],
    questions: [
      { q: "What's the weather?", options: ["cold", "rainy", "hot"], answer: 2 },
      { q: "Where do the children play?", options: ["water", "sand", "umbrella"], answer: 1 },
      { q: "What do they eat for lunch?", options: ["pasta", "pizza", "panino"], answer: 2 },
    ],
  },
  {
    id: "in-cucina",
    title: "In cucina con la nonna",
    emoji: "🍝",
    blurb: "Cooking with grandma",
    level: "A1",
    sentences: [
      { it: "Oggi cucino con mia nonna.", en: "Today I cook with my grandma." },
      { it: "Prepariamo la pasta al pomodoro.", en: "We make tomato pasta." },
      { it: "La nonna dice: «Aggiungi il basilico!»", en: "Grandma says: 'Add the basil!'" },
      { it: "Profuma di estate.", en: "It smells of summer." },
      { it: "Mangiamo insieme. Che bello!", en: "We eat together. How lovely!" },
    ],
    glossary: [
      { it: "cucino", en: "I cook" },
      { it: "prepariamo", en: "we prepare" },
      { it: "aggiungi", en: "add" },
      { it: "basilico", en: "basil" },
      { it: "insieme", en: "together" },
    ],
    questions: [
      { q: "Who do they cook with?", options: ["mom", "grandma", "friend"], answer: 1 },
      { q: "What dish?", options: ["pizza", "tomato pasta", "risotto"], answer: 1 },
      { q: "What does grandma add?", options: ["salt", "basil", "cheese"], answer: 1 },
    ],
  },
  {
    id: "viaggio-treno",
    title: "Un viaggio in treno",
    emoji: "🚆",
    blurb: "A train trip",
    level: "A1",
    sentences: [
      { it: "Parto da Firenze alle nove.", en: "I leave Florence at nine." },
      { it: "Il treno è veloce e comodo.", en: "The train is fast and comfortable." },
      { it: "Guardo i campi e le colline.", en: "I look at the fields and hills." },
      { it: "Arrivo a Venezia a mezzogiorno.", en: "I arrive in Venice at noon." },
      { it: "Che bel viaggio!", en: "What a beautiful trip!" },
    ],
    glossary: [
      { it: "parto", en: "I leave" },
      { it: "veloce", en: "fast" },
      { it: "campi", en: "fields" },
      { it: "colline", en: "hills" },
      { it: "mezzogiorno", en: "noon" },
    ],
    questions: [
      { q: "From which city does she leave?", options: ["Rome", "Florence", "Milan"], answer: 1 },
      { q: "What time does she arrive?", options: ["9", "noon", "evening"], answer: 1 },
      { q: "Where does she arrive?", options: ["Venice", "Naples", "Bologna"], answer: 0 },
    ],
  },
];

export function storyById(id: string) {
  return stories.find((s) => s.id === id);
}