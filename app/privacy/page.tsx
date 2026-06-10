"use client"

import Image from "next/image"
import { Database, Eye, ShieldCheck, Trophy, Users } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent } from "@/components/ui/card"

const SECTION_ICONS = [Users, Database, Eye, ShieldCheck] as const

export default function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] px-6 py-10 text-white shadow-2xl shadow-slate-950/10 sm:px-10 lg:px-12">
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            <Trophy className="h-4 w-4" />
            {t.common.worldCup}
          </div>

          <h1 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">{t.privacy.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">{t.privacy.subtitle}</p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {t.privacy.sections.map((section, index) => {
          const Icon = SECTION_ICONS[index] ?? ShieldCheck

          return (
            <Card key={section.title} className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-black tracking-tight text-slate-950">{section.title}</h2>
                </div>

                <div className="space-y-4 text-sm leading-7 text-slate-600">
                  {section.items.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
