"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CalendarDays, CheckCircle2, Lock, ShieldCheck, Trophy } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"
import { matchLabel } from "@/lib/i18n"
import { hasMatchStarted } from "@/lib/match-status"
import type { Match } from "@/lib/types"
import { getPredictedMatchIdsForEmployee, submitPrediction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DEPARTMENTS = ["Office", "Deco", "Warehouse", "Other"] as const

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
export function SubmitForm({ matches }: { matches: Match[] }) {
  const { lang, t } = useLanguage()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [department, setDepartment] = useState("")
  const [matchId, setMatchId] = useState("")
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [predictedPenaltyWinner, setPredictedPenaltyWinner] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [checkingPreviousPredictions, setCheckingPreviousPredictions] = useState(false)
  const [predictedMatchIds, setPredictedMatchIds] = useState<string[]>([])
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const shouldCheckPreviousPredictions = firstName.trim().length >= 2 && lastName.trim().length >= 2

  useEffect(() => {
    if (!shouldCheckPreviousPredictions) {
      setPredictedMatchIds([])
      setCheckingPreviousPredictions(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setCheckingPreviousPredictions(true)

      try {
        const result = await getPredictedMatchIdsForEmployee({ firstName, lastName })

        if (cancelled) return
        setPredictedMatchIds(result.ok ? result.matchIds : [])
      } finally {
        if (!cancelled) {
          setCheckingPreviousPredictions(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [firstName, lastName, shouldCheckPreviousPredictions])

  const upcomingMatches = useMemo(
    () => matches.filter((m) => m.status === "upcoming" && !hasMatchStarted(m, now)),
    [matches, now],
  )
  const availableMatches = useMemo(() => {
    if (!shouldCheckPreviousPredictions) return upcomingMatches

    const predicted = new Set(predictedMatchIds)
    return upcomingMatches.filter((match) => !predicted.has(match.id))
  }, [predictedMatchIds, shouldCheckPreviousPredictions, upcomingMatches])
  const selectedMatch = matches.find((m) => m.id === matchId)
  const selectedMatchLabel = selectedMatch ? matchLabel(selectedMatch, lang) : ""
  const selectedMatchStarted = Boolean(
    selectedMatch && selectedMatch.status === "upcoming" && hasMatchStarted(selectedMatch, now),
  )
  const locked = Boolean(selectedMatch && (selectedMatch.status !== "upcoming" || selectedMatchStarted))
  const isKnockout = selectedMatch?.stage_en !== "Group Stage"
  const predictedDraw = homeScore !== "" && awayScore !== "" && Number(homeScore) === Number(awayScore)
  const showPenaltyWinner = Boolean(selectedMatch && isKnockout && predictedDraw)

  useEffect(() => {
    if (!matchId) return
    if (availableMatches.some((match) => match.id === matchId)) return

    setMatchId("")
    setPredictedPenaltyWinner(null)
  }, [availableMatches, matchId])

  function validate(): string | null {
    if (!firstName.trim()) return t.errors.firstName
    if (!lastName.trim()) return t.errors.lastName
    if (!matchId) return t.errors.match
    if (homeScore === "" || awayScore === "") return t.errors.scores

    const h = Number(homeScore)
    const a = Number(awayScore)

    if (Number.isNaN(h) || Number.isNaN(a) || h < 0 || h > 20 || a < 0 || a > 20) {
      return t.errors.scores
    }

    if (selectedMatchStarted) return t.errors.matchStarted
    if (locked) return t.errors.locked
    if (showPenaltyWinner && !predictedPenaltyWinner) return t.submit.penaltyWinnerRequired

    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const error = validate()

    if (error) {
      toast.error(error)
      return
    }

    setSubmitting(true)

    try {
      const result = await submitPrediction({
        firstName,
        lastName,
        department,
        matchId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        predictedPenaltyWinner: showPenaltyWinner ? predictedPenaltyWinner : null,
        lang,
      })

      if (result.ok) {
        toast.success(t.success)
        setPredictedMatchIds((current) => Array.from(new Set([...current, matchId])))
        setMatchId("")
        setHomeScore("")
        setAwayScore("")
        setPredictedPenaltyWinner(null)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error(t.errors.generic)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] px-4 py-6 text-white shadow-2xl shadow-slate-950/10 sm:rounded-[2rem] sm:px-10 sm:py-10 lg:px-12">
        <Image
          src="/images/submit-prediction.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/90 to-[#07111f]/65" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative grid gap-5 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300 sm:mb-5 sm:px-4 sm:py-2 sm:tracking-[0.2em]">
              <Trophy className="h-4 w-4" />
              {t.common.worldCup}
            </div>

            <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl">{t.submit.title}</h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:mt-5 sm:text-base sm:leading-8">
              {t.submit.subtitle}
            </p>
          </div>

          <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur sm:gap-3 sm:rounded-[1.5rem] sm:p-5">
            <div className="flex gap-3 rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-bold">{t.submit.heroCards[0].title}</p>
                <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm sm:leading-6">{t.submit.heroCards[0].desc}</p>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-bold">{t.submit.heroCards[1].title}</p>
                <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm sm:leading-6">{t.submit.heroCards[1].desc}</p>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-bold">{t.submit.heroCards[2].title}</p>
                <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm sm:leading-6">{t.submit.heroCards[2].desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[0.72fr_0.28fr]">
        <Card className="overflow-visible border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 sm:py-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                {t.submit.formLabel}
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:mt-2 sm:text-2xl">
                {t.appName}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-4 sm:gap-6 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName">{t.submit.firstName}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="h-11"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName">{t.submit.lastName}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="department">{t.submit.department}</Label>
                <Select value={department} onValueChange={(value) => setDepartment(value ?? "")}>
                  <SelectTrigger id="department" className="h-11 w-full">
                    <SelectValue placeholder={t.submit.selectDepartment} />
                  </SelectTrigger>

                  <SelectContent
                    sideOffset={6}
                    className="z-[9999] max-h-80 overflow-y-auto"
                  >
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {t.departments[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="match">{t.submit.match}</Label>
                <Select
                  value={matchId}
                  onValueChange={(value) => {
                    setMatchId(value ?? "")
                    setPredictedPenaltyWinner(null)
                  }}
                >
                  <SelectTrigger id="match" className="h-11 w-full">
                    <span className={selectedMatch ? "truncate" : "truncate text-muted-foreground"}>
                      {selectedMatch ? selectedMatchLabel : t.submit.selectMatch}
                    </span>
                  </SelectTrigger>

                  <SelectContent
                    sideOffset={6}
                    className="z-[9999] max-h-80 overflow-y-auto"
                  >
                    {availableMatches.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {matchLabel(m, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(checkingPreviousPredictions || shouldCheckPreviousPredictions) && (
                  <p className="text-xs leading-5 text-slate-500">
                    {checkingPreviousPredictions
                      ? t.submit.checkingPreviousPredictions
                      : t.submit.previousPredictionsHidden}
                  </p>
                )}
                {shouldCheckPreviousPredictions && !checkingPreviousPredictions && upcomingMatches.length > 0 && availableMatches.length === 0 && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 sm:px-4 sm:py-3">
                    {t.submit.allAvailablePredicted}
                  </p>
                )}
              </div>

              {locked && (
                <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 sm:px-4 sm:py-3">
                  <Lock className="h-4 w-4" />
                  {selectedMatchStarted ? t.errors.matchStarted : t.errors.locked}
                </p>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <p className="mb-3 text-sm font-bold text-slate-950 sm:mb-4">{t.submit.expectedScore}</p>

                {selectedMatch ? (
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-4">
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="rounded-xl bg-white p-3 text-center shadow-sm sm:rounded-2xl sm:p-4">
                        {flagSrc(selectedMatch.home_team_en) ? (
                            <Image
                              src={flagSrc(selectedMatch.home_team_en)!}
                              alt={`${selectedMatch.home_team_en} ${t.common.flag}`}
                              width={64}
                              height={48}
                              className="mx-auto h-10 w-14 rounded-md object-cover shadow-sm sm:h-12 sm:w-16"
                            />
                          ) : (
                            <div className="text-sm font-bold text-slate-500">{t.common.noFlag}</div>
                          )}
                        <p className="mt-2 text-xs font-black text-slate-950 sm:text-sm">
                          {lang === "de" ? selectedMatch.home_team_de : selectedMatch.home_team_en}
                        </p>
                      </div>

                      <Label htmlFor="homeScore">{t.submit.homeScore}</Label>
                      <Input
                        id="homeScore"
                        type="number"
                        min={0}
                        max={20}
                        value={homeScore}
                        onChange={(e) => {
                          setHomeScore(e.target.value)
                          setPredictedPenaltyWinner(null)
                        }}
                        className="h-12 text-center text-xl font-black sm:h-14 sm:text-2xl"
                      />
                    </div>

                    <div className="hidden pb-4 text-3xl font-black text-slate-400 sm:block">:</div>

                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="rounded-xl bg-white p-3 text-center shadow-sm sm:rounded-2xl sm:p-4">
                        {flagSrc(selectedMatch.away_team_en) ? (
                          <Image
                            src={flagSrc(selectedMatch.away_team_en)!}
                            alt={`${selectedMatch.away_team_en} ${t.common.flag}`}
                            width={64}
                            height={48}
                            className="mx-auto h-10 w-14 rounded-md object-cover shadow-sm sm:h-12 sm:w-16"
                          />
                        ) : (
                          <div className="text-sm font-bold text-slate-500">{t.common.noFlag}</div>
                        )}
                        <p className="mt-2 text-xs font-black text-slate-950 sm:text-sm">
                          {lang === "de" ? selectedMatch.away_team_de : selectedMatch.away_team_en}
                        </p>
                      </div>

                      <Label htmlFor="awayScore">{t.submit.awayScore}</Label>
                      <Input
                        id="awayScore"
                        type="number"
                        min={0}
                        max={20}
                        value={awayScore}
                        onChange={(e) => {
                          setAwayScore(e.target.value)
                          setPredictedPenaltyWinner(null)
                        }}
                        className="h-12 text-center text-xl font-black sm:h-14 sm:text-2xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500 sm:p-6">
                    {t.submit.selectMatchFirst}
                  </div>
                )}

                {showPenaltyWinner && selectedMatch && (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:mt-4 sm:p-4">
                    <p className="mb-3 text-sm font-bold text-emerald-900">{t.submit.penaltyWinnerTitle}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          value: selectedMatch.home_team_en,
                          label: lang === "de" ? selectedMatch.home_team_de : selectedMatch.home_team_en,
                        },
                        {
                          value: selectedMatch.away_team_en,
                          label: lang === "de" ? selectedMatch.away_team_de : selectedMatch.away_team_en,
                        },
                      ].map((team) => (
                        <button
                          key={team.value}
                          type="button"
                          onClick={() => setPredictedPenaltyWinner(team.value)}
                          className={`flex items-center gap-3 rounded-xl border bg-white p-3 text-left text-sm font-black transition sm:rounded-2xl sm:p-4 ${
                            predictedPenaltyWinner === team.value
                              ? "border-emerald-500 text-emerald-700 ring-2 ring-emerald-100"
                              : "border-slate-200 text-slate-950 hover:border-emerald-300"
                          }`}
                        >
                          {flagSrc(team.value) ? (
                            <Image
                              src={flagSrc(team.value)!}
                              alt={`${team.value} ${t.common.flag}`}
                              width={40}
                              height={30}
                              className="h-7 w-10 shrink-0 rounded object-cover shadow-sm ring-1 ring-slate-200"
                            />
                          ) : (
                            <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-xs">
                              ⚽
                            </span>
                          )}
                          {team.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs leading-6 text-slate-500">
                {t.submit.acceptance.prefix}
                <Link href="/rules" className="font-bold text-emerald-700 underline underline-offset-2">
                  {t.submit.acceptance.rules}
                </Link>
                {t.submit.acceptance.between}
                <Link href="/privacy" className="font-bold text-emerald-700 underline underline-offset-2">
                  {t.submit.acceptance.privacy}
                </Link>
                {t.submit.acceptance.suffix}
              </p>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-full bg-emerald-500 text-sm font-bold text-white hover:bg-emerald-400"
              >
                {submitting ? t.submit.saving : t.submit.save}
              </Button>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:rounded-[1.5rem] sm:p-5">
            <p className="text-sm font-bold text-slate-950">{t.submit.howItWorksTitle}</p>

            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600 sm:mt-4 sm:space-y-3">
              {t.submit.howItWorksItems.map((item, index) => (
                <p key={item}>{index + 1}. {item}</p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:rounded-[1.5rem] sm:p-5">
            <p className="text-sm font-bold text-emerald-900">{t.submit.importantTitle}</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">{t.submit.importantText}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
