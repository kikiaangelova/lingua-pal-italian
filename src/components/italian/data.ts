export type Phrase = { it: string; en: string; pron: string };
export type Category = { id: string; title: string; emoji: string; blurb: string; phrases: Phrase[] };

export const categories: Category[] = [
  {
    id: "greetings",
    title: "Saluti",
    emoji: "👋",
    blurb: "Greetings & polite essentials",
    phrases: [
      { it: "Ciao", en: "Hi / Bye", pron: "chow" },
      { it: "Buongiorno", en: "Good morning", pron: "bwon-JOR-no" },
      { it: "Buonasera", en: "Good evening", pron: "bwo-na-SE-ra" },
      { it: "Arrivederci", en: "Goodbye", pron: "ar-ri-ve-DER-chi" },
      { it: "Per favore", en: "Please", pron: "per fa-VO-re" },
      { it: "Grazie mille", en: "Thank you so much", pron: "GRAT-zye MIL-le" },
      { it: "Prego", en: "You're welcome", pron: "PRE-go" },
      { it: "Mi scusi", en: "Excuse me", pron: "mee SKOO-zee" },
    ],
  },
  {
    id: "cafe",
    title: "Al Bar",
    emoji: "☕",
    blurb: "Order like a local",
    phrases: [
      { it: "Un caffè, per favore", en: "An espresso, please", pron: "oon kaf-FEH" },
      { it: "Un cappuccino", en: "A cappuccino", pron: "oon kap-poo-CHEE-no" },
      { it: "Un cornetto", en: "A croissant", pron: "oon kor-NET-to" },
      { it: "Il conto, per favore", en: "The bill, please", pron: "eel KON-to" },
      { it: "Quanto costa?", en: "How much is it?", pron: "KWAN-to KO-sta" },
      { it: "Acqua frizzante", en: "Sparkling water", pron: "AH-kwa free-TZAN-te" },
    ],
  },
  {
    id: "travel",
    title: "In Viaggio",
    emoji: "🚆",
    blurb: "Get around with confidence",
    phrases: [
      { it: "Dov'è la stazione?", en: "Where is the station?", pron: "do-VEH la sta-TZYO-ne" },
      { it: "A che ora parte?", en: "What time does it leave?", pron: "a ke O-ra PAR-te" },
      { it: "Un biglietto, per favore", en: "One ticket, please", pron: "oon bee-LYET-to" },
      { it: "A sinistra", en: "To the left", pron: "a see-NEE-stra" },
      { it: "A destra", en: "To the right", pron: "a DE-stra" },
      { it: "Sempre dritto", en: "Straight ahead", pron: "SEM-pre DREE-to" },
    ],
  },
  {
    id: "food",
    title: "A Tavola",
    emoji: "🍝",
    blurb: "Food, glorious food",
    phrases: [
      { it: "Ho fame", en: "I'm hungry", pron: "oh FA-me" },
      { it: "È delizioso!", en: "It's delicious!", pron: "eh de-lee-TZYO-zo" },
      { it: "Vorrei la pasta", en: "I'd like the pasta", pron: "vor-RAY la PA-sta" },
      { it: "Senza glutine", en: "Gluten free", pron: "SEN-tza GLOO-tee-ne" },
      { it: "Un bicchiere di vino", en: "A glass of wine", pron: "oon beek-KYE-re dee VEE-no" },
      { it: "Buon appetito!", en: "Enjoy your meal!", pron: "bwon ap-pe-TEE-to" },
    ],
  },
  {
    id: "feelings",
    title: "Sentimenti",
    emoji: "💛",
    blurb: "Express yourself",
    phrases: [
      { it: "Sto bene", en: "I'm well", pron: "sto BE-ne" },
      { it: "Sono felice", en: "I'm happy", pron: "SO-no fe-LEE-che" },
      { it: "Sono stanco", en: "I'm tired", pron: "SO-no STAN-ko" },
      { it: "Ti amo", en: "I love you", pron: "tee A-mo" },
      { it: "Mi manchi", en: "I miss you", pron: "mee MAN-kee" },
      { it: "Che bello!", en: "How beautiful!", pron: "ke BEL-lo" },
    ],
  },
  {
    id: "numbers",
    title: "Numeri",
    emoji: "🔢",
    blurb: "Count to ten",
    phrases: [
      { it: "Uno", en: "One", pron: "OO-no" },
      { it: "Due", en: "Two", pron: "DOO-eh" },
      { it: "Tre", en: "Three", pron: "treh" },
      { it: "Quattro", en: "Four", pron: "KWAT-tro" },
      { it: "Cinque", en: "Five", pron: "CHEEN-kweh" },
      { it: "Sei", en: "Six", pron: "say" },
      { it: "Sette", en: "Seven", pron: "SET-teh" },
      { it: "Otto", en: "Eight", pron: "OT-to" },
      { it: "Nove", en: "Nine", pron: "NO-veh" },
      { it: "Dieci", en: "Ten", pron: "DYEH-chee" },
    ],
  },
  {
    id: "family",
    title: "Famiglia",
    emoji: "👨‍👩‍👧",
    blurb: "People you love",
    phrases: [
      { it: "La madre", en: "Mother", pron: "la MA-dre" },
      { it: "Il padre", en: "Father", pron: "eel PA-dre" },
      { it: "Il fratello", en: "Brother", pron: "eel fra-TEL-lo" },
      { it: "La sorella", en: "Sister", pron: "la so-REL-la" },
      { it: "Il figlio", en: "Son", pron: "eel FEE-lyo" },
      { it: "La figlia", en: "Daughter", pron: "la FEE-lya" },
      { it: "L'amico", en: "Friend (m)", pron: "la-MEE-ko" },
      { it: "L'amica", en: "Friend (f)", pron: "la-MEE-ka" },
    ],
  },
  {
    id: "time",
    title: "Tempo",
    emoji: "⏰",
    blurb: "Days, time, weather",
    phrases: [
      { it: "Oggi", en: "Today", pron: "OD-jee" },
      { it: "Domani", en: "Tomorrow", pron: "do-MA-nee" },
      { it: "Ieri", en: "Yesterday", pron: "YEH-ree" },
      { it: "Adesso", en: "Now", pron: "a-DES-so" },
      { it: "Più tardi", en: "Later", pron: "pyoo TAR-dee" },
      { it: "Fa caldo", en: "It's hot", pron: "fa KAL-do" },
      { it: "Fa freddo", en: "It's cold", pron: "fa FRED-do" },
      { it: "Piove", en: "It's raining", pron: "PYO-ve" },
    ],
  },
];

// Quick lookup helper
export function deckById(id: string) {
  return categories.find((c) => c.id === id);
}

export const wordOfDay: Phrase = {
  it: "Dolce far niente",
  en: "The sweetness of doing nothing",
  pron: "DOL-che far NYEN-te",
};