import { notFound } from "next/navigation";
import { AppStoreBadge, Footer, Header } from "@/components/Chrome";
import { MoodSticker } from "@/components/Mood";
import { PhoneMockup } from "@/components/PhoneMockup";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getDictionary } from "@/dictionaries";
import { moods } from "@/lib/moods";
import { hasLocale, site } from "@/lib/site";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const waitlistLabels = {
    placeholder: dict.hero.emailPlaceholder,
    join: dict.hero.join,
    joined: dict.hero.joined,
    invalid: dict.hero.invalid,
    error: dict.hero.error,
  };

  const getApp = (source: string) =>
    site.appStoreUrl ? (
      <AppStoreBadge label={dict.hero.appStore} />
    ) : (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-plum/60">{dict.hero.comingSoon}</p>
        <WaitlistForm locale={lang} source={source} labels={waitlistLabels} />
      </div>
    );

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main>
        {/* Hero */}
        <section className="bg-dawn relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-coral">
                ☀️ {dict.hero.eyebrow}
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                {dict.hero.titleBefore}
                <em className="text-coral">{dict.hero.titleEm}</em>
                {dict.hero.titleAfter}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-plum/75">{dict.hero.sub}</p>
              <div id="get" className="mt-8 scroll-mt-24">
                {getApp("hero")}
              </div>
            </div>
            <div className="relative">
              <MoodSticker id="inlove" size={96} className="animate-float absolute -left-2 top-10 z-10 [--r:-10deg] max-sm:hidden" />
              <MoodSticker id="coffee" size={84} className="animate-float absolute -right-2 top-40 z-10 [--r:8deg] [animation-delay:1s] max-sm:hidden" />
              <MoodSticker id="grumpy" size={80} className="animate-float absolute bottom-16 left-0 z-10 [--r:6deg] [animation-delay:2s] max-sm:hidden" />
              <PhoneMockup partner={dict.mock.partner} you={dict.mock.you} app={dict.mock.app} />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <h2 className="font-display max-w-2xl text-4xl font-semibold sm:text-5xl">{dict.how.title}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {dict.how.steps.map((step, i) => (
              <div key={step.title} className="rounded-[28px] bg-white/70 p-7 ring-1 ring-plum/5">
                <div className="bg-sunrise mb-5 flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white">{i + 1}</div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-plum/70">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Moods */}
        <section id="moods" className="bg-plum scroll-mt-16 text-cream">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">{dict.moods.title}</h2>
            <p className="mt-4 max-w-xl text-lg text-cream/70">{dict.moods.sub}</p>
            <div className="mt-12 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {moods.map((mood) => (
                <div key={mood.id} className="relative flex flex-col items-center rounded-3xl bg-white/5 px-2 pb-4 pt-3 text-center">
                  <MoodSticker id={mood.id} size={96} alt={mood.label[lang]} />
                  <span className="mt-1 text-sm font-semibold">{mood.label[lang]}</span>
                  {mood.premium && (
                    <span className="absolute right-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold">{dict.moods.plus}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">{dict.uses.title}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {dict.uses.items.map((item) => (
              <div key={item.title} className="flex gap-5 rounded-[28px] bg-white/70 p-7 ring-1 ring-plum/5">
                <MoodSticker id={item.mood} size={72} className="shrink-0" />
                <div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-plum/70">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-dawn scroll-mt-16">
          <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
            <h2 className="font-display text-center text-4xl font-semibold sm:text-5xl">{dict.pricing.title}</h2>
            <p className="mt-4 text-center text-lg text-plum/70">{dict.pricing.sub}</p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-[32px] bg-white/70 p-8 ring-1 ring-plum/5">
                <h3 className="text-2xl font-bold">{dict.pricing.free.name}</h3>
                <p className="font-display mt-2 text-4xl font-semibold">{dict.pricing.free.price}</p>
                <ul className="mt-6 space-y-3">
                  {dict.pricing.free.features.map((f) => (
                    <li key={f} className="flex gap-3"><span className="text-coral">✓</span>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="relative rounded-[32px] bg-plum p-8 text-cream shadow-2xl shadow-plum/20">
                <span className="bg-sunrise absolute -top-3 right-8 rounded-full px-4 py-1 text-sm font-bold text-white">{dict.pricing.plus.badge}</span>
                <h3 className="font-display text-3xl font-semibold italic">{dict.pricing.plus.name}</h3>
                <p className="font-display mt-2 text-4xl font-semibold">{dict.pricing.plus.price}</p>
                <p className="mt-1 text-cream/70">
                  {dict.pricing.plus.alt} · <span className="font-semibold text-gold">{dict.pricing.plus.trial}</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {dict.pricing.plus.features.map((f) => (
                    <li key={f} className="flex gap-3"><span className="text-gold">✓</span>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-24 sm:px-6">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">{dict.faq.title}</h2>
          <div className="mt-10 divide-y divide-plum/10">
            {dict.faq.items.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {item.q}
                  <span className="text-coral transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-plum/70">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-sunrise">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center text-white sm:px-6">
            <MoodSticker id="sunny" size={110} />
            <h2 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">{dict.final.title}</h2>
            <p className="mt-4 text-lg text-white/85">{dict.final.sub}</p>
            <div className="mt-8 flex justify-center text-left text-plum">{getApp("footer")}</div>
          </div>
        </section>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
