// Site-wide settings. Server-side values are read at request time in the
// Docker container (see .env.example); NEXT_PUBLIC_* are baked in at build.
export const site = {
  name: "Morni",
  url: (process.env.SITE_URL ?? "https://morni.app").replace(/\/$/, ""),
  appStoreUrl: process.env.NEXT_PUBLIC_APP_STORE_URL ?? "",
  contactEmail: process.env.CONTACT_EMAIL ?? "hello@morni.app",
  legalName: process.env.LEGAL_NAME ?? "Morni",
  legalAddress: process.env.LEGAL_ADDRESS ?? "",
};

export const locales = ["en", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);
