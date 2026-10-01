export type Locale = "en" | "fr" | "es";

export const asLocale = (v: unknown): Locale => (v === "fr" || v === "es" ? v : "en");

// Keep in sync with design/moods/moods.json.
const moods: Record<string, Record<Locale, string>> = {
  sunny: { en: "Radiant", fr: "Au top", es: "Radiante" },
  sleepy: { en: "Still in bed", fr: "Encore au lit", es: "Aún en la cama" },
  grumpy: { en: "Grumpy", fr: "Grognon", es: "De malas" },
  inlove: { en: "In love", fr: "Trop love", es: "Modo amor" },
  missyou: { en: "Miss you", fr: "Tu me manques", es: "Te extraño" },
  coffee: { en: "Need coffee", fr: "Besoin de café", es: "Necesito café" },
  cuddle: { en: "Need a hug", fr: "Besoin d'un câlin", es: "Quiero un abrazo" },
  sick: { en: "Under the weather", fr: "Patraque", es: "Con fiebre" },
  hungry: { en: "Hangry", fr: "Faim de loup", es: "Con hambre" },
  proud: { en: "So proud", fr: "Fierté", es: "Orgullo" },
  kiss: { en: "Kiss", fr: "Bisou", es: "Besito" },
  spicy: { en: "Spicy", fr: "Mode coquin", es: "Picante" },
  fire: { en: "On fire", fr: "À fond", es: "A tope" },
  party: { en: "Party mode", fr: "Mode fête", es: "De fiesta" },
  sad: { en: "A bit sad", fr: "Un peu triste", es: "Un poco triste" },
  jealous: { en: "Jealous", fr: "Jalousie", es: "Celos" },
  cool: { en: "Feeling cool", fr: "Mode stylé", es: "Con estilo" },
  angel: { en: "Angel", fr: "Ange", es: "Angelito" },
  devil: { en: "Little devil", fr: "Petit diable", es: "Diablillo" },
  shy: { en: "Shy", fr: "Timide", es: "Con vergüenza" },
  melting: { en: "Melting", fr: "Je fonds", es: "Me derrito" },
  pizza: { en: "Pizza night", fr: "Soirée pizza", es: "Noche de pizza" },
  plane: { en: "On my way", fr: "J'arrive", es: "Voy para allá" },
  goodnight: { en: "Good night", fr: "Bonne nuit", es: "Buenas noches" },
  freezing: { en: "Freezing", fr: "Je caille", es: "Qué frío" },
};

export const MOOD_IDS = Object.keys(moods);

const text = {
  dropBody: {
    en: "dropped a selfie. Come see 👀",
    fr: "a posté son selfie. Viens voir 👀",
    es: "subió su selfie. Ven a verlo 👀",
  },
  dropBodyYourTurn: {
    en: "dropped today's selfie. Your turn ☀️",
    fr: "a posté son selfie du jour. À ton tour ☀️",
    es: "subió su selfie de hoy. Te toca ☀️",
  },
  joined: {
    en: (n: string) => `${n} joined you on Morni ❤️`,
    fr: (n: string) => `${n} t'a rejoint sur Morni ❤️`,
    es: (n: string) => `${n} se unió a ti en Morni ❤️`,
  },
  joinedBody: {
    en: "Your first selfie will land on their home screen.",
    fr: "Ton premier selfie arrivera sur son écran d'accueil.",
    es: "Tu primer selfie llegará a su pantalla de inicio.",
  },
  reaction: {
    en: (n: string, e: string) => `${n} reacted ${e} to your selfie`,
    fr: (n: string, e: string) => `${n} a réagi ${e} à ton selfie`,
    es: (n: string, e: string) => `${n} reaccionó ${e} a tu selfie`,
  },
  nudge: {
    en: (n: string) => `${n} misses you 💌`,
    fr: (n: string) => `${n} pense à toi 💌`,
    es: (n: string) => `${n} te extraña 💌`,
  },
  nudgeBody: {
    en: "Send them a selfie?",
    fr: "Tu lui envoies un selfie ?",
    es: "¿Le mandas un selfie?",
  },
  reminder: {
    en: (n: string) => n ? `Your turn! ${n} is waiting for today's selfie ☀️` : "Your turn! Time for today's selfie ☀️",
    fr: (n: string) =>
      n ? `Ton tour ! ${n} attend ton selfie du jour ☀️` : "Ton tour ! C'est l'heure du selfie du jour ☀️",
    es: (n: string) => n ? `¡Te toca! ${n} espera tu selfie de hoy ☀️` : "¡Te toca! Hora del selfie de hoy ☀️",
  },
  someone: { en: "Your person", fr: "Ta moitié", es: "Tu persona" },
};

export const t = {
  mood: (id: string | null | undefined, l: Locale) => (id && moods[id] ? moods[id][l] : null),
  dropTitle: (name: string, mood: string | null | undefined, l: Locale) => {
    const who = name || text.someone[l];
    const label = t.mood(mood, l);
    return label ? `${who} · ${label}` : who;
  },
  dropBody: (recipientPostedToday: boolean, l: Locale) =>
    recipientPostedToday ? text.dropBody[l] : text.dropBodyYourTurn[l],
  joined: (name: string, l: Locale) => text.joined[l](name || text.someone[l]),
  joinedBody: (l: Locale) => text.joinedBody[l],
  reaction: (name: string, emoji: string, l: Locale) => text.reaction[l](name || text.someone[l], emoji),
  nudge: (name: string, l: Locale) => text.nudge[l](name || text.someone[l]),
  nudgeBody: (l: Locale) => text.nudgeBody[l],
  reminder: (partner: string, l: Locale) => text.reminder[l](partner),
};
