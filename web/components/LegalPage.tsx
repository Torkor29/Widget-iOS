import type { Section } from "@/dictionaries/en";
import type { Dictionary } from "@/dictionaries";
import { site, type Locale } from "@/lib/site";
import { Footer, Header } from "./Chrome";

const fill = (text: string) =>
  text
    .replaceAll("{company}", site.legalName)
    .replaceAll("{address}", site.legalAddress ? `, ${site.legalAddress}` : "")
    .replaceAll("{email}", site.contactEmail);

export function LegalPage({ lang, dict, title, sections, path }: { lang: Locale; dict: Dictionary; title: string; sections: Section[]; path: string }) {
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-plum/50">{dict.legal.updated}</p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.h}>
              <h2 className="text-xl font-bold">{section.h}</h2>
              {section.p.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-plum/75">
                  {fill(paragraph)}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer lang={lang} dict={dict} path={path} />
    </>
  );
}
