"use client"

import Image from "next/image"
import { Fragment, useState } from "react"
import { Trophy, Users, ListChecks, Building2, Crown, Medal, Minus, Plus } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type LeaderboardPrediction = {
  id: string
  matchNumber: number
  homeTeamEn: string
  homeTeamDe: string
  awayTeamEn: string
  awayTeamDe: string
  predictedHomeScore: number
  predictedAwayScore: number
  actualHomeScore: number | null
  actualAwayScore: number | null
  matchStatus: "upcoming" | "live" | "finished"
  points: number
  isExactScore: boolean
  isCorrectOutcome: boolean
}

export type LeaderboardRow = {
  id: string
  name: string
  department: string
  displayRank: number
  points: number
  exactScores: number
  correctOutcomes: number
  predictions: number
  predictionsList: LeaderboardPrediction[]
}

const TEAM_FLAG_CODES: Record<string, string> = {
  Mexico: "mx",
  "South Africa": "za",
  "South Korea": "kr",
  Czechia: "cz",
  Canada: "ca",
  "Bosnia and Herzegovina": "ba",
  "United States": "us",
  Paraguay: "py",
  Qatar: "qa",
  Switzerland: "ch",
  Brazil: "br",
  Morocco: "ma",
  Haiti: "ht",
  Scotland: "gb-sct",
  Australia: "au",
  Turkiye: "tr",
  Türkiye: "tr",
  Germany: "de",
  Curacao: "cw",
  Netherlands: "nl",
  Japan: "jp",
  "Ivory Coast": "ci",
  Ecuador: "ec",
  Sweden: "se",
  Tunisia: "tn",
  Spain: "es",
  "Cape Verde": "cv",
  Belgium: "be",
  Egypt: "eg",
  "Saudi Arabia": "sa",
  Uruguay: "uy",
  Iran: "ir",
  "New Zealand": "nz",
  France: "fr",
  Senegal: "sn",
  Iraq: "iq",
  Norway: "no",
  Argentina: "ar",
  Algeria: "dz",
  Austria: "at",
  Jordan: "jo",
  Portugal: "pt",
  "Congo DR": "cd",
  England: "gb-eng",
  Croatia: "hr",
  Ghana: "gh",
  Panama: "pa",
  Uzbekistan: "uz",
  Colombia: "co",
}

function flagSrc(teamName: string) {
  const code = TEAM_FLAG_CODES[teamName]
  return code ? `/flags/${code}.svg` : null
}

function TeamFlag({ teamName }: { teamName: string }) {
  const { t } = useLanguage()
  const src = flagSrc(teamName)

  if (!src) {
    return (
      <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-xs ring-1 ring-slate-200">
        ⚽
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={`${teamName} ${t.common.flag}`}
      width={32}
      height={24}
      className="h-6 w-8 shrink-0 rounded object-cover shadow-sm ring-1 ring-slate-200"
    />
  )
}

function pointsExplanationKey(prediction: LeaderboardPrediction) {
  if (prediction.matchStatus !== "finished") return "pending"
  if (prediction.isExactScore) return "exactScore"
  if (prediction.isCorrectOutcome) return "correctOutcome"
  return "noPoints"
}

export function LeaderboardView({
  rows,
  totalPredictions,
  bestDepartment,
  hasRealLeader,
}: {
  rows: LeaderboardRow[]
  totalPredictions: number
  bestDepartment: string | null
  hasRealLeader: boolean
}) {
  const { lang, t } = useLanguage()
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  const leader = rows[0]
  const departmentLabel = (dept: string) =>
    t.departments[dept as keyof typeof t.departments] ?? dept

  const stats = [
    { icon: Trophy, label: t.leaderboard.currentLeader, value: hasRealLeader && leader ? leader.name : t.leaderboard.none },
    { icon: Users, label: t.leaderboard.totalPlayers, value: String(rows.length) },
    { icon: ListChecks, label: t.leaderboard.totalPredictions, value: String(totalPredictions) },
    {
      icon: Building2,
      label: t.leaderboard.bestDepartment,
      value: bestDepartment ? departmentLabel(bestDepartment) : t.leaderboard.none,
    },
  ]

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] px-6 py-10 text-white shadow-2xl shadow-slate-950/10 sm:px-10 lg:px-12">
        <Image
          src="/images/leaderboard.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/90 to-[#07111f]/65" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              <Trophy className="h-4 w-4" />
              {t.common.worldCup}
            </div>

            <h1 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">{t.leaderboard.title}</h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
              {t.leaderboard.subtitle}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  {t.leaderboard.currentLeader}
                </p>
                <p className="mt-2 truncate text-lg font-black">{hasRealLeader && leader ? leader.name : t.leaderboard.none}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  {t.leaderboard.totalPlayers}
                </p>
                <p className="mt-2 text-lg font-black">{rows.length}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  {t.leaderboard.totalPredictions}
                </p>
                <p className="mt-2 text-lg font-black">{totalPredictions}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{s.label}</p>
                <p className="mt-1 truncate text-lg font-black text-slate-950">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">{t.leaderboard.currentRanking}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{t.leaderboard.title}</h2>
            </div>
            <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:flex">
              <Medal className="h-5 w-5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="w-20 px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.leaderboard.rank}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.leaderboard.name}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.leaderboard.department}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.leaderboard.points}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.leaderboard.exact}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.leaderboard.outcomes}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t.leaderboard.predictions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      {t.leaderboard.empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => {
                    const expanded = expandedRowId === row.id

                    return (
                      <Fragment key={row.id}>
                        <TableRow className="border-slate-100">
                          <TableCell className="px-6 py-4 font-medium">
                            {hasRealLeader && row.displayRank === 1 ? (
                              <span className="inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full bg-amber-100 px-2 text-xs font-black text-amber-800 ring-1 ring-amber-200">
                                <Crown className="h-3.5 w-3.5" />
                                {row.displayRank}
                              </span>
                            ) : hasRealLeader && row.displayRank <= 3 ? (
                              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                                {row.displayRank}
                              </span>
                            ) : (
                              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                                {row.displayRank}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 font-bold text-slate-950">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setExpandedRowId(expanded ? null : row.id)}
                                aria-label={expanded ? `${t.leaderboard.hidePredictions} ${row.name}` : `${t.leaderboard.showPredictions} ${row.name}`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
                              >
                                {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </button>
                              <span>{row.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                              {departmentLabel(row.department)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right text-lg font-black text-emerald-600">
                            {row.points}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right font-medium text-slate-500">
                            {row.exactScores}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right font-medium text-slate-500">
                            {row.correctOutcomes}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right font-medium text-slate-500">
                            {row.predictions}
                          </TableCell>
                        </TableRow>

                        {expanded && (
                          <TableRow className="border-slate-100 bg-slate-50/80">
                            <TableCell colSpan={7} className="px-6 py-5">
                              <div className="grid gap-3">
                                {row.predictionsList.map((prediction) => {
                                  const homeTeam = lang === "de" ? prediction.homeTeamDe : prediction.homeTeamEn
                                  const awayTeam = lang === "de" ? prediction.awayTeamDe : prediction.awayTeamEn
                                  const finished =
                                    prediction.matchStatus === "finished" &&
                                    prediction.actualHomeScore !== null &&
                                    prediction.actualAwayScore !== null
                                  const explanationKey = pointsExplanationKey(prediction)
                                  const explanation =
                                    explanationKey === "pending"
                                      ? t.common.pending
                                      : t.leaderboard[explanationKey]

                                  return (
                                    <div
                                      key={prediction.id}
                                      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                                    >
                                      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold text-slate-950">
                                        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                                          #{prediction.matchNumber}
                                        </span>
                                        <TeamFlag teamName={prediction.homeTeamEn} />
                                        <span className="truncate">{homeTeam}</span>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 font-black text-slate-700">
                                          {prediction.predictedHomeScore}:{prediction.predictedAwayScore}
                                        </span>
                                        <span className="truncate">{awayTeam}</span>
                                        <TeamFlag teamName={prediction.awayTeamEn} />
                                      </div>

                                      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                                        <div className="text-sm text-slate-500 lg:text-right">
                                          <span className="font-bold text-slate-700">{t.leaderboard.actual}: </span>
                                          {finished
                                            ? `${prediction.actualHomeScore} : ${prediction.actualAwayScore}`
                                            : t.common.pending}
                                        </div>

                                        <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-600 ring-1 ring-emerald-100">
                                          {prediction.points} {t.common.pointsShort}
                                        </div>

                                        <Badge
                                          variant="secondary"
                                          className={
                                            explanationKey === "exactScore"
                                              ? "bg-amber-50 text-amber-800 hover:bg-amber-50"
                                              : explanationKey === "correctOutcome"
                                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                                          }
                                        >
                                          {explanation}
                                        </Badge>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
