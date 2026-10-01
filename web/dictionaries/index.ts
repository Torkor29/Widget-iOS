import "server-only";
import type { Locale } from "@/lib/site";
import en, { type Dictionary } from "./en";
import es from "./es";
import fr from "./fr";

const dictionaries: Record<Locale, Dictionary> = { en, fr, es };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
export type { Dictionary };
