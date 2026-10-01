import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { locales, site, type Locale } from "@/lib/site";

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-30 border-b border-plum/5 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <Image src="/icon.svg" width={32} height={32} alt="" className="rounded-[9px]" unoptimized />
          <span className="font-display text-2xl font-semibold italic">{site.name}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-plum/70 md:flex">
          <a href={`/${lang}#how`} className="hover:text-plum">{dict.nav.how}</a>
          <a href={`/${lang}#moods`} className="hover:text-plum">{dict.nav.moods}</a>
          <a href={`/${lang}#pricing`} className="hover:text-plum">{dict.nav.pricing}</a>
          <a href={`/${lang}#faq`} className="hover:text-plum">{dict.nav.faq}</a>
        </nav>
        <a href={site.appStoreUrl || `/${lang}#get`} className="rounded-full bg-plum px-4 py-2 text-sm font-bold text-cream hover:bg-plum/90">
          {dict.nav.cta}
        </a>
      </div>
    </header>
  );
}

export function Footer({ lang, dict, path = "" }: { lang: Locale; dict: Dictionary; path?: string }) {
  return (
    <footer className="border-t border-plum/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-plum/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <Image src="/icon.svg" width={24} height={24} alt="" className="rounded-md" unoptimized />
          <span>
            © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <Link href={`/${lang}/privacy`} className="hover:text-plum">{dict.footer.privacy}</Link>
          <Link href={`/${lang}/terms`} className="hover:text-plum">{dict.footer.terms}</Link>
          <Link href={`/${lang}/support`} className="hover:text-plum">{dict.footer.support}</Link>
          <span className="flex gap-2" aria-label="Language">
            {locales.map((l) => (
              <Link key={l} href={`/${l}${path}`} className={l === lang ? "font-bold text-plum" : "hover:text-plum"} hrefLang={l}>
                {l.toUpperCase()}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function AppStoreBadge({ label }: { label: string }) {
  return (
    <a
      href={site.appStoreUrl}
      className="inline-flex items-center gap-3 rounded-2xl bg-black px-5 py-3 text-white shadow-lg hover:bg-black/85"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
        <path d="M16.37 12.62c.02 2.37 2.08 3.16 2.1 3.17-.02.06-.33 1.13-1.08 2.23-.65.96-1.33 1.91-2.4 1.93-1.05.02-1.39-.62-2.59-.62-1.2 0-1.58.6-2.57.64-1.03.04-1.82-1.03-2.48-1.99-1.35-1.95-2.38-5.52-1-7.93.69-1.2 1.92-1.96 3.25-1.98 1.01-.02 1.97.68 2.59.68.62 0 1.78-.84 3-.72.51.02 1.95.21 2.87 1.56-.07.05-1.71 1-1.69 3.03ZM14.4 6.8c.55-.67.92-1.59.82-2.51-.79.03-1.75.53-2.32 1.19-.51.59-.95 1.53-.83 2.43.88.07 1.78-.45 2.33-1.11Z" />
      </svg>
      <span className="text-left text-lg font-semibold leading-tight">{label}</span>
    </a>
  );
}
