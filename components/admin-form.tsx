"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CalendarDays, CircleDot, Info, LogOut, ShieldCheck, Trophy } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"
import { formatMatchDate, teamNames } from "@/lib/i18n"
import { getDisplayMatchStatus, type DisplayMatchStatus } from "@/lib/match-status"
import type { Match } from "@/lib/types"
import { adminLogout, saveMatchResult } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
      <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500 ring-1 ring-slate-200">
        <CircleDot className="h-4 w-4" />
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={`${teamName} ${t.common.flag}`}
      width={36}
      height={27}
      className="h-7 w-9 shrink-0 rounded object-cover shadow-sm ring-1 ring-slate-200"
    />
  )
}

function statusClass(status: DisplayMatchStatus) {
  if (status === "finished") return "bg-[#07111f] text-white"
  if (status === "live") return "bg-emerald-500 text-white"
  if (status === "awaiting_result") return "bg-amber-50 text-amber-700"
  return "bg-slate-100 text-slate-700"
}

function matchOptionLabel(match: Match, lang: "en" | "de", vs: string) {
  const home = lang === "de" ? match.home_team_de : match.home_team_en
  const away = lang === "de" ? match.away_team_de : match.away_team_en
  const time = match.match_time ? `, ${match.match_time}` : ""
  return `#${match.match_number} ${home} ${vs} ${away} - ${formatMatchDate(match.match_date, lang)}${time}`
}

export function AdminForm({ matches }: { matches: Match[] }) {
  const { lang, t } = useLanguage()
  const router = useRouter()
  const [matchId, setMatchId] = useState("")
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [penaltyWinner, setPenaltyWinner] = useState<string | null>(null)
  const [status, setStatus] = useState<Match["status"]>("upcoming")
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [now, setNow] = useState(() => new Date())

  const selectedMatch = matches.find((m) => m.id === matchId)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      setHomeScore(selectedMatch.home_score !== null ? String(selectedMatch.home_score) : "")
      setAwayScore(selectedMatch.away_score !== null ? String(selectedMatch.away_score) : "")
      setPenaltyWinner(selectedMatch.penalty_winner)
      setStatus(selectedMatch.status)
    }
  }, [selectedMatch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!matchId) {
      toast.error(t.errors.match)
      return
    }
    const needsScore = status === "finished" || status === "live"
    if (needsScore && (homeScore === "" || awayScore === "")) {
      toast.error(t.errors.scores)
      return
    }
    const selectedIsKnockout = selectedMatch?.stage_en !== "Group Stage"
    const resultDraw = Number(homeScore || 0) === Number(awayScore || 0)
    const needsPenaltyWinner = status === "finished" && Boolean(selectedMatch && selectedIsKnockout && resultDraw)
    if (needsPenaltyWinner && !penaltyWinner) {
      toast.error(t.admin.penaltyWinnerRequired)
      return
    }

    setSaving(true)
    try {
      const result = await saveMatchResult({
        matchId,
        homeScore: Number(homeScore || 0),
        awayScore: Number(awayScore || 0),
        status,
        penaltyWinner: needsPenaltyWinner ? penaltyWinner : null,
      })
      if (result.ok) {
        toast.success(t.admin.success)
        router.refresh()
      } else if (result.error === "unauthorized") {
        toast.error(t.errors.unauthorized)
        router.refresh()
      } else if (result.error === "penaltyWinnerRequired") {
        toast.error(t.admin.penaltyWinnerRequired)
      } else {
        toast.error(t.errors.generic)
      }
    } catch {
      toast.error(t.errors.generic)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const result = await adminLogout()
      if (result.ok) {
        toast.success(t.admin.signedOut)
        router.refresh()
      } else {
        toast.error(t.errors.generic)
      }
    } catch {
      toast.error(t.errors.generic)
    } finally {
      setLoggingOut(false)
    }
  }

  const selectedNames = selectedMatch ? teamNames(selectedMatch, lang) : null
  const selectedStage = selectedMatch ? (lang === "de" ? selectedMatch.stage_de : selectedMatch.stage_en) : null
  const selectedDisplayStatus = selectedMatch ? getDisplayMatchStatus(selectedMatch, now) : null
  const selectedHasScore =
    selectedMatch && selectedMatch.home_score !== null && selectedMatch.away_score !== null
  const selectedIsKnockout = selectedMatch?.stage_en !== "Group Stage"
  const editedResultDraw = homeScore !== "" && awayScore !== "" && Number(homeScore) === Number(awayScore)
  const showPenaltyWinner = Boolean(selectedMatch && selectedIsKnockout && status === "finished" && editedResultDraw)
  const homeScoreLabel = selectedNames
    ? `${selectedNames.home} ${t.admin.scoreSuffix}`
    : t.admin.teamOneScore
  const awayScoreLabel = selectedNames
    ? `${selectedNames.away} ${t.admin.scoreSuffix}`
    : t.admin.teamTwoScore

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] px-4 py-6 text-white shadow-2xl shadow-slate-950/10 sm:rounded-[2rem] sm:px-10 sm:py-10 lg:px-12">
        <Image
          src="/images/match-results.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/90 to-[#07111f]/65" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300 sm:mb-5 sm:px-4 sm:py-2 sm:tracking-[0.2em]">
              <ShieldCheck className="h-4 w-4" />
              {t.admin.area}
            </div>

            <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl">{t.admin.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:mt-5 sm:text-base sm:leading-8">
              {t.admin.subtitle}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-fit gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? t.admin.loggingOut : t.admin.logout}
          </Button>
        </div>
      </section>

      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[0.42fr_0.58fr]">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-3 sm:mb-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 sm:h-11 sm:w-11">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">{t.admin.selectedMatch}</p>
                <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{t.admin.preview}</h2>
              </div>
            </div>

            {!selectedMatch || !selectedNames ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 sm:p-6">
                {t.admin.selectMatchPreview}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {selectedStage}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {t.common.matchNumber} #{selectedMatch.match_number}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(selectedDisplayStatus!)}`}>
                    {t.status[selectedDisplayStatus!]}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {formatMatchDate(selectedMatch.match_date, lang)}
                    {selectedMatch.match_time ? `, ${selectedMatch.match_time}` : ""}
                  </div>

                  <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <TeamFlag teamName={selectedMatch.home_team_en} />
                        <span className="truncate text-sm font-black text-slate-950">{selectedNames.home}</span>
                      </div>
                      <span className="text-lg font-black text-slate-950">
                        {selectedHasScore ? selectedMatch.home_score : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <TeamFlag teamName={selectedMatch.away_team_en} />
                        <span className="truncate text-sm font-black text-slate-950">{selectedNames.away}</span>
                      </div>
                      <span className="text-lg font-black text-slate-950">
                        {selectedHasScore ? selectedMatch.away_score : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600 sm:p-4">
                  <span className="font-bold text-slate-950">{t.admin.currentResult}: </span>
                  {selectedHasScore ? `${selectedMatch.home_score} : ${selectedMatch.away_score}` : t.admin.noResultYet}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">{t.admin.resultUpdate}</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:mt-2 sm:text-2xl">{t.appName}</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="adminMatch">{t.admin.selectMatch}</Label>
                <Select value={matchId} onValueChange={(value) => setMatchId(value ?? "")}>
                  <SelectTrigger id="adminMatch" className="h-11 w-full">
                    <span className={selectedMatch ? "truncate" : "truncate text-muted-foreground"}>
                      {selectedMatch ? matchOptionLabel(selectedMatch, lang, t.common.vs) : t.admin.selectPrompt}
                    </span>
                  </SelectTrigger>
                  <SelectContent sideOffset={6} className="z-[9999] max-h-80 overflow-y-auto">
                    {matches.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {matchOptionLabel(m, lang, t.common.vs)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminHome">{homeScoreLabel}</Label>
                  <Input
                    id="adminHome"
                    type="number"
                    min={0}
                    max={20}
                    value={homeScore}
                    onChange={(e) => {
                      setHomeScore(e.target.value)
                      setPenaltyWinner(null)
                    }}
                    className="h-12 text-center text-xl font-black sm:h-14 sm:text-2xl"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminAway">{awayScoreLabel}</Label>
                  <Input
                    id="adminAway"
                    type="number"
                    min={0}
                    max={20}
                    value={awayScore}
                    onChange={(e) => {
                      setAwayScore(e.target.value)
                      setPenaltyWinner(null)
                    }}
                    className="h-12 text-center text-xl font-black sm:h-14 sm:text-2xl"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="adminStatus">{t.admin.status}</Label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus((value ?? "upcoming") as Match["status"])
                    setPenaltyWinner(null)
                  }}
                >
                  <SelectTrigger id="adminStatus" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent sideOffset={6} className="z-[9999] max-h-80 overflow-y-auto">
                    <SelectItem value="upcoming">{t.status.upcoming}</SelectItem>
                    <SelectItem value="live">{t.status.live}</SelectItem>
                    <SelectItem value="finished">{t.status.finished}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showPenaltyWinner && selectedMatch && selectedNames && (
                <div className="flex flex-col gap-2">
                  <Label>{t.admin.penaltyWinner}</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: selectedMatch.home_team_en, label: selectedNames.home },
                      { value: selectedMatch.away_team_en, label: selectedNames.away },
                    ].map((team) => (
                      <button
                        key={team.value}
                        type="button"
                        onClick={() => setPenaltyWinner(team.value)}
                        className={`flex items-center gap-3 rounded-xl border bg-white p-3 text-left text-sm font-black transition sm:rounded-2xl sm:p-4 ${
                          penaltyWinner === team.value
                            ? "border-emerald-500 text-emerald-700 ring-2 ring-emerald-100"
                            : "border-slate-200 text-slate-950 hover:border-emerald-300"
                        }`}
                      >
                        <TeamFlag teamName={team.value} />
                        {team.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800 sm:p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p>{t.admin.recalculateInfo}</p>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="h-12 w-full rounded-full bg-emerald-500 text-sm font-bold text-white hover:bg-emerald-400"
              >
                {saving ? t.admin.saving : t.admin.save}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
