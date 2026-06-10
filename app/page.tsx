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
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] px-6 py-10 text-white shadow-2xl shadow-slate-950/10 sm:px-10 lg:px-14 lg:py-16">
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

        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              <Sparkles className="h-4 w-4" />
              {t.home.badge}
            </div>

            <h1 className="text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {t.home.title}
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-white/70 sm:text-lg">
              {t.home.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
              >
                {t.home.cards.submit.title}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                {t.home.cards.leaderboard.title}
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="rounded-2xl bg-white p-5 text-slate-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{t.home.hubEyebrow}</p>
                  <h2 className="mt-2 text-2xl font-black">{t.home.hubTitle}</h2>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Trophy className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {t.home.hubItems.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            {t.home.sectionEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {t.home.sectionTitle}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full overflow-hidden border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
                <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                </div>

                <CardHeader className="p-6">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <card.icon className="h-6 w-6" />
                  </span>

                  <CardTitle className="flex items-center justify-between gap-4 text-xl">
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

      <section className="grid gap-5 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 md:grid-cols-3">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
            <ClipboardList className="h-5 w-5" />
          </span>

          <div>
            <h3 className="font-bold text-slate-950">{t.home.features[0].title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t.home.features[0].desc}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </span>

          <div>
            <h3 className="font-bold text-slate-950">{t.home.features[1].title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t.home.features[1].desc}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
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
