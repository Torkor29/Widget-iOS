import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { getDictionary } from "@/dictionaries";
import { hasLocale } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/support">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: `${getDictionary(lang).legal.supportTitle} · Morni` } : {};
}

export default async function SupportPage({ params }: PageProps<"/[lang]/support">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return <LegalPage lang={lang} dict={dict} title={dict.legal.supportTitle} sections={dict.legal.support} path="/support" />;
}
