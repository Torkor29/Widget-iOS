import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { getDictionary } from "@/dictionaries";
import { hasLocale } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: `${getDictionary(lang).legal.termsTitle} · Morni` } : {};
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return <LegalPage lang={lang} dict={dict} title={dict.legal.termsTitle} sections={dict.legal.terms} path="/terms" />;
}
