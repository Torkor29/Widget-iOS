import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppStoreBadge, Footer, Header } from "@/components/Chrome";
import { CopyCode } from "@/components/CopyCode";
import { MoodSticker } from "@/components/Mood";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getDictionary } from "@/dictionaries";
import { invitePreview } from "@/lib/supabase";
import { hasLocale, site } from "@/lib/site";

const normalize = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

export async function generateMetadata({ params }: PageProps<"/[lang]/i/[code]">): Promise<Metadata> {
  const { lang, code } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  const name = await invitePreview(normalize(code));
  const title = name ? dict.invite.ogNamed.replace("{name}", name) : dict.invite.ogAnon;
  return { title: `${title} · Morni`, description: dict.meta.description, openGraph: { title, description: dict.meta.description } };
}

export default async function InvitePage({ params }: PageProps<"/[lang]/i/[code]">) {
  const { lang, code: rawCode } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const code = normalize(rawCode);
  const name = await invitePreview(code);
  const title = name ? dict.invite.titleNamed.replace("{name}", name) : dict.invite.titleAnon;

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="bg-dawn">
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
          <div className="flex -space-x-4">
            <MoodSticker id="inlove" size={96} className="-rotate-6" />
            <MoodSticker id="sunny" size={104} className="rotate-6" />
          </div>
          <h1 className="font-display mt-6 text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 text-lg text-plum/70">{dict.invite.sub}</p>

          <ol className="mt-10 w-full space-y-4 text-left">
            <li className="rounded-[28px] bg-white/80 p-6 ring-1 ring-plum/5">
              <p className="font-bold"><span className="text-coral">1.</span> {dict.invite.step1}</p>
              <div className="mt-4">
                {site.appStoreUrl ? (
                  <AppStoreBadge label={dict.hero.appStore} />
                ) : (
                  <p className="text-sm font-semibold text-plum/60">{dict.hero.comingSoon}</p>
                )}
              </div>
            </li>
            <li className="rounded-[28px] bg-white/80 p-6 ring-1 ring-plum/5">
              <p className="font-bold"><span className="text-coral">2.</span> {dict.invite.step2}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="font-mono text-4xl font-bold tracking-[0.3em]">{code}</span>
                <CopyCode code={code} copy={dict.invite.copy} copied={dict.invite.copied} />
              </div>
            </li>
          </ol>

          <a href={`morni://i/${code}`} className="mt-8 w-full rounded-full bg-coral px-6 py-4 text-lg font-bold text-white shadow-lg shadow-coral/30">
            {dict.invite.open}
          </a>

          <div className="mt-12 w-full rounded-[28px] bg-white/50 p-6 text-left">
            <p className="text-sm font-semibold text-plum/70">{dict.invite.android}</p>
            <div className="mt-3">
              <WaitlistForm
                locale={lang}
                source="invite-android"
                labels={{ placeholder: dict.hero.emailPlaceholder, join: dict.hero.join, joined: dict.hero.joined, invalid: dict.hero.invalid, error: dict.hero.error }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer lang={lang} dict={dict} path={`/i/${code}`} />
    </>
  );
}
