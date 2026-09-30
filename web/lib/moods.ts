// Copy of design/moods/moods.json (the web app is built from web/ only).
import type { Locale } from "./site";

export type Mood = { id: string; premium: boolean; label: Record<Locale, string> };

export const moods: Mood[] = [
  { id: "sunny", premium: false, label: { en: "Radiant", fr: "Au top", es: "Radiante" } },
  { id: "sleepy", premium: false, label: { en: "Still in bed", fr: "Encore au lit", es: "Aún en la cama" } },
  { id: "grumpy", premium: false, label: { en: "Grumpy", fr: "Grognon", es: "De malas" } },
  { id: "inlove", premium: false, label: { en: "In love", fr: "Trop love", es: "Modo amor" } },
  { id: "missyou", premium: false, label: { en: "Miss you", fr: "Tu me manques", es: "Te extraño" } },
  { id: "coffee", premium: false, label: { en: "Need coffee", fr: "Besoin de café", es: "Necesito café" } },
  { id: "cuddle", premium: true, label: { en: "Need a hug", fr: "Besoin d'un câlin", es: "Quiero un abrazo" } },
  { id: "sick", premium: true, label: { en: "Under the weather", fr: "Patraque", es: "Con fiebre" } },
  { id: "hungry", premium: true, label: { en: "Hangry", fr: "Faim de loup", es: "Con hambre" } },
  { id: "fire", premium: true, label: { en: "On fire", fr: "À fond", es: "A tope" } },
  { id: "spicy", premium: true, label: { en: "Spicy", fr: "Mode coquin", es: "Picante" } },
  { id: "proud", premium: true, label: { en: "So proud", fr: "Fierté", es: "Orgullo" } },
];
