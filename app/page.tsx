"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, Trophy } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="relative left-1/2 -my-8 w-screen -translate-x-1/2 overflow-hidden bg-[#030811] text-white md:-my-12">
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden border-b border-white/10">
        <Image
          src="/images/world-cup-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-30 object-cover object-[62%_center] opacity-75"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#030811_0%,rgba(3,8,17,.94)_35%,rgba(3,8,17,.64)_70%,rgba(3,8,17,.76)_100%)]" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(0deg,#030811_0%,transparent_36%,rgba(3,8,17,.12)_100%)]" />
        <div className="absolute -right-40 top-14 -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-400/12 blur-[110px]" />
        <div className="absolute -left-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-amber-400/8 blur-[100px]" />

        <div className="pointer-events-none absolute inset-y-0 right-[7%] -z-10 hidden w-px bg-gradient-to-b from-transparent via-white/20 to-transparent xl:block" />
        <div className="pointer-events-none absolute right-[calc(7%-12rem)] top-1/2 -z-10 hidden h-96 w-96 -translate-y-1/2 rounded-full border border-white/8 xl:block" />
        <div className="pointer-events-none absolute right-[calc(7%-7rem)] top-1/2 -z-10 hidden h-56 w-56 -translate-y-1/2 rounded-full border border-white/8 xl:block" />

        <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,.72fr)] lg:px-12 xl:px-16">
          <div className="min-w-0 max-w-4xl">
            <div className="mb-10 flex items-center gap-3 sm:mb-14">
              <span className="h-px w-9 bg-emerald-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.32em] text-white">SIMEX</p>
                <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/45 sm:text-xs">
                  {t.retired.gameName}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3.5 py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/75 backdrop-blur-md sm:text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[#03140d]">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
              {t.retired.completed}
            </div>

            <h1 className="mt-7 text-balance uppercase leading-[0.84] tracking-[-0.06em] sm:mt-9">
              <span className="block text-[clamp(4rem,13vw,9.5rem)] font-black text-white">{t.retired.championCountry}</span>
              <span className="mt-5 block max-w-2xl text-xl font-black tracking-[0.08em] text-amber-300 sm:mt-7 sm:text-3xl lg:text-4xl">
                {t.retired.championTitle}
              </span>
            </h1>

            <p className="mt-7 max-w-xl break-words text-pretty text-sm leading-7 text-white/58 sm:mt-9 sm:text-base sm:leading-8">
              {t.retired.heroNote}
            </p>
          </div>

          <div className="relative mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:justify-self-end">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-red-500/20 via-amber-300/5 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#07111f]/72 p-3 shadow-[0_35px_100px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-4">
              <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-gradient-to-br from-white/12 to-white/4 px-6 py-8 sm:px-8 sm:py-10">
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[32px] border-white/[0.035]" />
                <div className="absolute -bottom-28 -left-24 h-64 w-64 rounded-full border-[42px] border-amber-300/[0.035]" />

                <div className="relative flex items-center justify-between gap-5">
                  <div className="overflow-hidden rounded-xl border border-white/20 bg-white p-1.5 shadow-xl shadow-black/30">
                    <Image
                      src="/flags/es.svg"
                      alt={`${t.retired.championCountry} ${t.common.flag}`}
                      width={84}
                      height={56}
                      className="h-12 w-[4.5rem] rounded-md object-cover sm:h-14 sm:w-[5.25rem]"
                    />
                  </div>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-300 sm:h-16 sm:w-16">
                    <Trophy className="h-7 w-7 sm:h-8 sm:w-8" />
                  </span>
                </div>

                <div className="relative mt-14 border-t border-white/12 pt-6 sm:mt-20 sm:pt-8">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-white/45">{t.retired.completed}</p>
                  <p className="mt-3 text-4xl font-black uppercase tracking-[-0.045em] text-white sm:text-5xl">
                    {t.retired.championCountry}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300 sm:text-sm">
                    {t.retired.championTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
        <div className="absolute inset-0 -z-20 bg-[#030811]" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/8" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/8" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/7 blur-[100px]" />
        <div className="absolute left-0 right-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto flex w-fit items-center gap-4 text-[0.65rem] font-black uppercase tracking-[0.3em] text-emerald-300 sm:text-xs">
            <span>2026</span>
            <span className="h-px w-14 bg-gradient-to-r from-emerald-300 to-white/25 sm:w-24" />
            <span className="flex h-3 w-3 rounded-full border border-emerald-200/50 bg-emerald-300 shadow-[0_0_24px_rgba(52,211,153,.65)]" />
            <span className="h-px w-14 bg-gradient-to-r from-white/25 to-emerald-300 sm:w-24" />
            <span>2030</span>
          </div>

          <p className="mt-12 text-xs font-black uppercase tracking-[0.28em] text-white/42 sm:text-sm">
            {t.retired.returnEyebrow}
          </p>
          <h2 className="mt-5 text-balance text-4xl font-black uppercase tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
            {t.retired.returnTitle}
          </h2>

          <p className="mt-12 text-xs font-black uppercase tracking-[0.35em] text-emerald-300 sm:text-sm">
            {t.retired.nextTournament}
          </p>
          <div className="mt-1 bg-gradient-to-b from-white via-white to-white/10 bg-clip-text text-[clamp(7rem,24vw,15rem)] font-black leading-[0.9] tracking-[-0.09em] text-transparent">
            2030
          </div>

          <p className="mt-9 text-2xl font-black tracking-tight text-white sm:text-3xl">{t.retired.seeYou}</p>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-white/52 sm:text-base sm:leading-8">
            {t.retired.returnBody}
          </p>
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-[#07111f] px-5 py-16 sm:px-8 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(52,211,153,.10),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-9 rounded-[2rem] border border-white/12 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">{t.retired.archiveEyebrow}</p>
            <h2 className="mt-4 text-balance text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
              {t.retired.archiveTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">{t.retired.archiveBody}</p>
          </div>

          <div className="lg:text-right">
            <Link
              href="/archive/2026"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-black text-[#03140d] shadow-[0_16px_45px_rgba(52,211,153,.2)] transition hover:bg-emerald-300 sm:w-auto sm:px-7 sm:py-4"
            >
              {t.retired.archiveButton}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-3 text-center text-xs text-white/55 lg:text-right">{t.retired.archiveNote}</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#030811] px-5 py-7 text-center text-xs text-white/55 sm:px-8">
        <p>{t.retired.footer}</p>
      </footer>
    </div>
  )
}
