"use client"

import Image from "next/image"
import {
  Calculator,
  CheckCircle2,
  ClipboardList,
  Lock,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent } from "@/components/ui/card"

function RuleList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2 sm:space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-6 text-slate-600 sm:gap-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function RulesPage() {
  const { t } = useLanguage()

  const sections = [
    { icon: Users, title: t.rules.howToParticipate.title, items: t.rules.howToParticipate.items },
    { icon: Lock, title: t.rules.predictionRules.title, items: t.rules.predictionRules.items },
    { icon: Trophy, title: t.rules.knockoutMatches.title, items: t.rules.knockoutMatches.items },
    { icon: ShieldCheck, title: t.rules.fairPlay.title, items: t.rules.fairPlay.items },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] px-4 py-6 text-white shadow-2xl shadow-slate-950/10 sm:rounded-[2rem] sm:px-10 sm:py-10 lg:px-12">
        <Image
          src="/images/rules.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/90 to-[#07111f]/65" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300 sm:mb-5 sm:px-4 sm:py-2 sm:tracking-[0.2em]">
            <Trophy className="h-4 w-4" />
            {t.common.worldCup}
          </div>

          <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl">{t.rules.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:mt-5 sm:text-base sm:leading-8">{t.rules.subtitle}</p>
        </div>
      </section>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 sm:h-11 sm:w-11">
                  <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{section.title}</h2>
              </div>
              <RuleList items={section.items} />
            </CardContent>
          </Card>
        ))}

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-3 sm:mb-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 sm:h-11 sm:w-11">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{t.rules.scoringSystem.title}</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {t.rules.scoringSystem.items.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:rounded-2xl sm:p-4">
                  <p className="text-sm font-bold text-slate-600">{item.label}</p>
                  <p className="mt-1 text-xl font-black text-emerald-600 sm:mt-2 sm:text-2xl">{item.points}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-3 sm:mb-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 ring-1 ring-emerald-100 sm:h-11 sm:w-11">
                <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <h2 className="text-lg font-black tracking-tight text-emerald-950 sm:text-xl">{t.rules.example.title}</h2>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm sm:p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.rules.example.actualLabel}
                  </p>
                  <p className="mt-1 text-base font-black text-slate-950 sm:mt-2 sm:text-lg">{t.rules.example.actual}</p>
                </div>

                <div className="hidden text-2xl font-black text-emerald-500 sm:block">{t.common.vs}</div>

                <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.rules.example.predictionLabel}
                  </p>
                  <p className="mt-1 text-base font-black text-slate-950 sm:mt-2 sm:text-lg">{t.rules.example.prediction}</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-emerald-50 p-3 sm:mt-4 sm:p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                  {t.rules.example.pointsLabel}
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-900 sm:mt-2">{t.rules.example.points}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
