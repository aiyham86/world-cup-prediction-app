"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart3, CalendarCheck, ClipboardList, ShieldCheck, Sparkles, Trophy } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const { t } = useLanguage()

  const cards = [
    { href: "/submit", icon: ClipboardList, image: "/images/submit-prediction.jpg", ...t.home.cards.submit },
    { href: "/leaderboard", icon: BarChart3, image: "/images/leaderboard.jpg", ...t.home.cards.leaderboard },
    { href: "/results", icon: CalendarCheck, image: "/images/match-results.jpg", ...t.home.cards.results },
  ]

  return (
    <div className="space-y-6 sm:space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] px-4 py-6 text-white shadow-2xl shadow-slate-950/10 sm:rounded-[2rem] sm:px-10 sm:py-10 lg:px-14 lg:py-16">
        <Image
          src="/images/world-cup-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/90 to-[#07111f]/65" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative grid gap-5 sm:gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300 sm:mb-6 sm:px-4 sm:py-2 sm:tracking-[0.22em]">
              <Sparkles className="h-4 w-4" />
              {t.home.badge}
            </div>

            <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {t.home.title}
            </h1>

            <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">
              {t.home.subtitle}
            </p>

            <div className="mt-4 grid gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3">
              {t.home.prizes.map((prize) => (
                <div
                  key={prize.place}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur sm:rounded-2xl sm:px-4 sm:py-3"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300 sm:tracking-[0.16em]">{prize.place}</p>
                  <p className="mt-1 text-lg font-black text-white sm:text-xl">{prize.amount}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 sm:px-6 sm:py-3"
              >
                {t.home.cards.submit.title}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 sm:px-6 sm:py-3"
              >
                {t.home.cards.leaderboard.title}
              </Link>

              <Link
                href="/rules"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-500/10 px-5 py-2.5 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20 sm:px-6 sm:py-3"
              >
                {t.home.readRules}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur sm:rounded-[1.5rem] sm:p-5">
            <div className="rounded-xl bg-white p-4 text-slate-950 sm:rounded-2xl sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{t.home.hubEyebrow}</p>
                  <h2 className="mt-1 text-xl font-black sm:mt-2 sm:text-2xl">{t.home.hubTitle}</h2>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:mt-6 sm:gap-3">
                {t.home.hubItems.map((item) => (
                  <div key={item.title} className="rounded-xl border border-slate-200 p-3 sm:rounded-2xl sm:p-4">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 sm:space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            {t.home.sectionEyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:mt-2 sm:text-2xl">
            {t.home.sectionTitle}
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full overflow-hidden border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
                <div className="relative h-28 w-full overflow-hidden bg-slate-100 sm:h-36">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                </div>

                <CardHeader className="p-4 sm:p-6">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition-colors group-hover:bg-emerald-500 group-hover:text-white sm:mb-4 sm:h-12 sm:w-12 sm:rounded-2xl">
                    <card.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>

                  <CardTitle className="flex items-center justify-between gap-4 text-lg sm:text-xl">
                    {card.title}
                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                  </CardTitle>

                  <CardDescription className="text-sm leading-6">
                    {card.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:gap-5 sm:rounded-[2rem] sm:p-6 md:grid-cols-3">
        <div className="flex gap-3 sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
            <ClipboardList className="h-5 w-5" />
          </span>

          <div>
            <h3 className="font-bold text-slate-950">{t.home.features[0].title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t.home.features[0].desc}</p>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
            <BarChart3 className="h-5 w-5" />
          </span>

          <div>
            <h3 className="font-bold text-slate-950">{t.home.features[1].title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t.home.features[1].desc}</p>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
            <ShieldCheck className="h-5 w-5" />
          </span>

          <div>
            <h3 className="font-bold text-slate-950">{t.home.features[2].title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t.home.features[2].desc}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
