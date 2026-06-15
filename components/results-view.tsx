"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { CalendarCheck, CalendarDays, ChevronDown, CircleDot, Search } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MatchTalk } from "@/components/match-talk"
import { teamNames } from "@/lib/i18n"
import { getDisplayMatchStatus, getKickoffDate, type DisplayMatchStatus } from "@/lib/match-status"
import type { Match, MatchComment, MatchReaction, Prediction } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STAGE_FILTERS = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Third Place",
  "Final",
] as const

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

type TeamOption = {
  en: string
  de: string
  flagCode: string
}

type PredictionScoreGroup = {
  key: string
  label: string
  count: number
  homeScore: number
  awayScore: number
}

type PredictionSummary = {
  groups: PredictionScoreGroup[]
  noPredictionCount: number
}

type MatchDateGroup = {
  date: string
  matches: Match[]
  statusCounts: Record<DisplayMatchStatus, number>
  sortRank: number
  sortTime: number
}

const DISPLAY_STATUS_ORDER = ["finished", "live", "awaiting_result", "upcoming"] as const

function flagSrc(teamName: string) {
  const code = TEAM_FLAG_CODES[teamName]
  return code ? `/flags/${code}.svg` : null
}

function TeamFlag({ teamName }: { teamName: string }) {
  const { t } = useLanguage()
  const src = flagSrc(teamName)

  if (!src) {
    return (
      <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500 ring-1 ring-slate-200">
        <CircleDot className="h-4 w-4" />
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

function StatusBadge({ status }: { status: DisplayMatchStatus }) {
  const { t } = useLanguage()
  const className =
    status === "finished"
      ? "bg-slate-100 text-slate-700 hover:bg-slate-100"
      : status === "live"
        ? "bg-emerald-500 text-white hover:bg-emerald-500"
        : status === "awaiting_result"
          ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"

  return (
    <Badge variant={status === "upcoming" ? "outline" : "secondary"} className={className}>
      {t.status[status]}
    </Badge>
  )
}

function formatDateHeading(dateStr: string, lang: "en" | "de") {
  const date = new Date(`${dateStr}T00:00:00`)
  return new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getMatchTime(match: Match) {
  return getKickoffDate(match)?.getTime() ?? new Date(`${match.match_date}T00:00:00`).getTime()
}

export function ResultsView({
  matches,
  totalEmployees,
  predictions,
  reactions,
  comments,
}: {
  matches: Match[]
  totalEmployees: number
  predictions: Prediction[]
  reactions: MatchReaction[]
  comments: MatchComment[]
}) {
  const { lang, t } = useLanguage()
  const [search, setSearch] = useState("")
  const [teamFilter, setTeamFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | DisplayMatchStatus>("all")
  const [stageFilter, setStageFilter] = useState<"all" | (typeof STAGE_FILTERS)[number]>("all")
  const [now, setNow] = useState(() => new Date())
  const [expandedSummaryMatchIds, setExpandedSummaryMatchIds] = useState<Set<string>>(() => new Set())
  const [expandedDayOverrides, setExpandedDayOverrides] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const teamOptions = useMemo(() => {
    const teams = new Map<string, TeamOption>()

    for (const match of matches) {
      const homeFlagCode = TEAM_FLAG_CODES[match.home_team_en]
      const awayFlagCode = TEAM_FLAG_CODES[match.away_team_en]

      if (homeFlagCode && !teams.has(match.home_team_en)) {
        teams.set(match.home_team_en, {
          en: match.home_team_en,
          de: match.home_team_de,
          flagCode: homeFlagCode,
        })
      }

      if (awayFlagCode && !teams.has(match.away_team_en)) {
        teams.set(match.away_team_en, {
          en: match.away_team_en,
          de: match.away_team_de,
          flagCode: awayFlagCode,
        })
      }
    }

    return Array.from(teams.values()).sort((a, b) => {
      const nameA = lang === "de" ? a.de : a.en
      const nameB = lang === "de" ? b.de : b.en
      return nameA.localeCompare(nameB)
    })
  }, [lang, matches])

  const selectedTeam = teamOptions.find((team) => team.en === teamFilter)

  const reactionsByMatch = useMemo(() => {
    const grouped = new Map<string, MatchReaction[]>()

    for (const reaction of reactions) {
      const list = grouped.get(reaction.match_id) ?? []
      list.push(reaction)
      grouped.set(reaction.match_id, list)
    }

    return grouped
  }, [reactions])

  const commentsByMatch = useMemo(() => {
    const grouped = new Map<string, MatchComment[]>()

    for (const comment of comments) {
      const list = grouped.get(comment.match_id) ?? []
      list.push(comment)
      grouped.set(comment.match_id, list)
    }

    return grouped
  }, [comments])

  const togglePredictionSummary = (matchId: string) => {
    setExpandedSummaryMatchIds((current) => {
      const next = new Set(current)

      if (next.has(matchId)) {
        next.delete(matchId)
      } else {
        next.add(matchId)
      }

      return next
    })
  }

  const toggleDay = (date: string, currentExpanded: boolean) => {
    setExpandedDayOverrides((current) => ({
      ...current,
      [date]: !currentExpanded,
    }))
  }

  const predictionSummaryByMatch = useMemo(() => {
    const summaries = new Map<string, { totalPredicted: number; groups: Map<string, PredictionScoreGroup> }>()

    for (const match of matches) {
      summaries.set(match.id, {
        totalPredicted: 0,
        groups: new Map<string, PredictionScoreGroup>(),
      })
    }

    for (const prediction of predictions) {
      const summary = summaries.get(prediction.match_id) ?? {
        totalPredicted: 0,
        groups: new Map<string, PredictionScoreGroup>(),
      }
      const key = `${prediction.predicted_home_score}-${prediction.predicted_away_score}`
      const group =
        summary.groups.get(key) ??
        {
          key,
          label: key,
          count: 0,
          homeScore: prediction.predicted_home_score,
          awayScore: prediction.predicted_away_score,
        }

      group.count += 1
      summary.totalPredicted += 1
      summary.groups.set(key, group)
      summaries.set(prediction.match_id, summary)
    }

    return new Map<string, PredictionSummary>(
      Array.from(summaries.entries()).map(([matchId, summary]) => [
        matchId,
        {
          groups: Array.from(summary.groups.values()).sort(
            (a, b) => b.count - a.count || a.homeScore - b.homeScore || a.awayScore - b.awayScore
          ),
          noPredictionCount: Math.max(totalEmployees - summary.totalPredicted, 0),
        },
      ])
    )
  }, [matches, predictions, totalEmployees])

  const statusCounterMatches = useMemo(() => {
    const query = search.trim().toLowerCase()

    return matches.filter((match) => {
      const searchableTeams = [
        match.home_team_en,
        match.away_team_en,
        match.home_team_de,
        match.away_team_de,
      ]
        .join(" ")
        .toLowerCase()

      const matchesSearch = query === "" || searchableTeams.includes(query)
      const matchesTeam =
        teamFilter === "all" || match.home_team_en === teamFilter || match.away_team_en === teamFilter
      const matchesStage = stageFilter === "all" || match.stage_en === stageFilter

      return matchesSearch && matchesTeam && matchesStage
    })
  }, [matches, search, stageFilter, teamFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<DisplayMatchStatus, number> = {
      upcoming: 0,
      live: 0,
      finished: 0,
      awaiting_result: 0,
    }

    for (const match of statusCounterMatches) {
      counts[getDisplayMatchStatus(match, now)] += 1
    }

    return counts
  }, [now, statusCounterMatches])

  const groupedMatches = useMemo<MatchDateGroup[]>(() => {
    const visibleMatches = statusCounterMatches
      .filter((match) => {
        const displayStatus = getDisplayMatchStatus(match, now)
        return statusFilter === "all" || displayStatus === statusFilter
      })
      .sort(
        (a, b) =>
          a.match_date.localeCompare(b.match_date) ||
          (a.match_time ?? "").localeCompare(b.match_time ?? "") ||
          a.match_number - b.match_number
      )

    const groupsByDate = visibleMatches.reduce<Map<string, Match[]>>((groups, match) => {
      const group = groups.get(match.match_date) ?? []
      group.push(match)
      groups.set(match.match_date, group)
      return groups
    }, new Map())

    return Array.from(groupsByDate.entries())
      .map(([date, dateMatches]) => {
        const statusCounts: Record<DisplayMatchStatus, number> = {
          upcoming: 0,
          live: 0,
          finished: 0,
          awaiting_result: 0,
        }

        for (const match of dateMatches) {
          statusCounts[getDisplayMatchStatus(match, now)] += 1
        }

        const liveOrAwaitingTimes = dateMatches
          .filter((match) => {
            const status = getDisplayMatchStatus(match, now)
            return status === "live" || status === "awaiting_result"
          })
          .map(getMatchTime)
        const upcomingTimes = dateMatches
          .filter((match) => getDisplayMatchStatus(match, now) === "upcoming")
          .map(getMatchTime)
        const allTimes = dateMatches.map(getMatchTime)

        const sortRank = statusCounts.live > 0 || statusCounts.awaiting_result > 0 ? 0 : statusCounts.upcoming > 0 ? 1 : 2
        const sortTime =
          sortRank === 0
            ? Math.min(...liveOrAwaitingTimes)
            : sortRank === 1
              ? Math.min(...upcomingTimes)
              : Math.max(...allTimes)

        return {
          date,
          matches: dateMatches,
          statusCounts,
          sortRank,
          sortTime,
        }
      })
      .sort((a, b) => {
        if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank
        return a.sortRank === 2 ? b.sortTime - a.sortTime : a.sortTime - b.sortTime
      })
  }, [now, statusCounterMatches, statusFilter])

  const defaultUpcomingDate = useMemo(() => {
    if (groupedMatches.length === 0) return null

    return groupedMatches.find((group) => group.statusCounts.upcoming > 0)?.date ?? null
  }, [groupedMatches])

  const statusSummary = (group: MatchDateGroup) =>
    (["live", "awaiting_result", "upcoming", "finished"] as const)
      .filter((status) => group.statusCounts[status] > 0)
      .map((status) => `${group.statusCounts[status]} ${t.results.statusLabels[status]}`)
      .join(", ")

  const activeDateGroups = groupedMatches.filter((group) => group.sortRank !== 2)
  const finishedDateGroups = groupedMatches.filter((group) => group.sortRank === 2)
  const visibleDateGroups = activeDateGroups
  const showFinishedResultsSection = finishedDateGroups.length > 0
  const finishedResultsKey = "__finished_results__"
  const finishedResultsExpanded = expandedDayOverrides[finishedResultsKey] ?? statusFilter === "finished"
  const finishedMatchCount = finishedDateGroups.reduce((count, group) => count + group.matches.length, 0)
  const finishedResultsSummary = `${finishedMatchCount} ${t.results.finishedMatches}${
    finishedDateGroups.length > 0 ? ` / ${finishedDateGroups.length} ${t.results.finishedDates}` : ""
  }`

  const renderMatchCard = (match: Match) => {
    const { home, away } = teamNames(match, lang)
    const stage = lang === "en" ? match.stage_en : match.stage_de
    const hasScore = match.home_score !== null && match.away_score !== null
    const penaltyWinner =
      match.penalty_winner === match.home_team_en
        ? home
        : match.penalty_winner === match.away_team_en
          ? away
          : null
    const showPenaltyWinner =
      match.status === "finished" &&
      match.stage_en !== "Group Stage" &&
      match.home_score !== null &&
      match.away_score !== null &&
      match.home_score === match.away_score &&
      penaltyWinner
    const displayStatus = getDisplayMatchStatus(match, now)
    const predictionSummary = predictionSummaryByMatch.get(match.id)
    const showPredictionSummary = displayStatus !== "upcoming" && predictionSummary
    const correctScoreKey = hasScore ? `${match.home_score}-${match.away_score}` : null
    const correctScoreGroup = correctScoreKey
      ? predictionSummary?.groups.find((group) => group.key === correctScoreKey)
      : null
    const sortedScoreGroups = predictionSummary
      ? [
          ...(correctScoreGroup ? [correctScoreGroup] : []),
          ...predictionSummary.groups.filter((group) => group.key !== correctScoreKey),
        ]
      : []
    const summaryExpanded = expandedSummaryMatchIds.has(match.id)
    const visibleScoreGroups = summaryExpanded ? sortedScoreGroups : sortedScoreGroups.slice(0, 5)
    const hiddenScoreGroupCount = Math.max(sortedScoreGroups.length - visibleScoreGroups.length, 0)

    return (
      <Card key={match.id} className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              {stage}
            </Badge>
            <StatusBadge status={displayStatus} />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center justify-end gap-2 text-right">
              <span className="truncate text-sm font-black text-slate-950">{home}</span>
              <TeamFlag teamName={match.home_team_en} />
            </div>

            <span className="min-w-16 rounded-full bg-slate-100 px-3 py-1.5 text-center text-sm font-black text-slate-950 ring-1 ring-slate-200 sm:min-w-20 sm:px-4 sm:py-2 sm:text-base">
              {hasScore ? `${match.home_score} - ${match.away_score}` : "-"}
            </span>

            <div className="flex min-w-0 items-center gap-2">
              <TeamFlag teamName={match.away_team_en} />
              <span className="truncate text-sm font-black text-slate-950">{away}</span>
            </div>
          </div>

          {showPredictionSummary && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                {t.results.predictionSummary}
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleScoreGroups.map((group) => (
                  <span
                    key={group.key}
                    className={
                      group.key === correctScoreKey
                        ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-900 ring-1 ring-emerald-300 sm:px-3"
                        : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 sm:px-3"
                    }
                  >
                    {group.label} &middot; {group.count}
                  </span>
                ))}
                {predictionSummary.noPredictionCount > 0 && (
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 ring-1 ring-rose-200 sm:px-3">
                    {t.results.noPrediction} &middot; {predictionSummary.noPredictionCount}
                  </span>
                )}
              </div>
              {(hiddenScoreGroupCount > 0 || summaryExpanded) && (
                <button
                  type="button"
                  onClick={() => togglePredictionSummary(match.id)}
                  className="text-xs font-bold text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  {summaryExpanded
                    ? t.results.fewerScorePredictions
                    : t.results.moreScorePredictions(hiddenScoreGroupCount)}
                </button>
              )}
            </div>
          )}

          <MatchTalk
            matchId={match.id}
            initialReactions={reactionsByMatch.get(match.id) ?? []}
            initialComments={commentsByMatch.get(match.id) ?? []}
          />

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
            <span>{t.common.matchNumber} #{match.match_number}</span>
            <span>{match.match_time ?? "-"}</span>
          </div>

          {showPenaltyWinner && (
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 sm:px-4 sm:py-3">
              {penaltyWinner} {t.results.advancesOnPenalties}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

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

        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300 sm:mb-5 sm:px-4 sm:py-2 sm:tracking-[0.2em]">
            <CalendarDays className="h-4 w-4" />
            {t.common.worldCup}
          </div>

          <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl">{t.results.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:mt-5 sm:text-base sm:leading-8">
            {t.results.subtitle}
          </p>
        </div>
      </section>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-3 p-4 sm:gap-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_220px]">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.results.team}</span>
            <Select value={teamFilter} onValueChange={(value) => setTeamFilter(value ?? "all")}>
              <SelectTrigger className="h-11 w-full">
                {selectedTeam ? (
                  <span className="flex min-w-0 items-center gap-2">
                    <TeamFlag teamName={selectedTeam.en} />
                    <span className="truncate">{lang === "de" ? selectedTeam.de : selectedTeam.en}</span>
                  </span>
                ) : (
                  <SelectValue placeholder={t.results.allTeams} />
                )}
              </SelectTrigger>
              <SelectContent sideOffset={6} className="z-[9999] max-h-80 overflow-y-auto">
                <SelectItem value="all">{t.results.allTeams}</SelectItem>
                {teamOptions.map((team) => (
                  <SelectItem key={team.en} value={team.en}>
                    <span className="flex min-w-0 items-center gap-2">
                      <TeamFlag teamName={team.en} />
                      <span className="truncate">{lang === "de" ? team.de : team.en}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.results.searchTeam}</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Switzerland"
                className="h-11 pl-9"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.results.status}</span>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter((value ?? "all") as "all" | DisplayMatchStatus)}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent sideOffset={6} className="z-[9999]">
                <SelectItem value="all">{t.results.all}</SelectItem>
                <SelectItem value="upcoming">{t.status.upcoming}</SelectItem>
                <SelectItem value="live">{t.status.live}</SelectItem>
                <SelectItem value="awaiting_result">{t.status.awaiting_result}</SelectItem>
                <SelectItem value="finished">{t.status.finished}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.results.stage}</span>
            <Select
              value={stageFilter}
              onValueChange={(value) => setStageFilter((value ?? "all") as "all" | (typeof STAGE_FILTERS)[number])}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent sideOffset={6} className="z-[9999] max-h-80 overflow-y-auto">
                <SelectItem value="all">{t.results.allStages}</SelectItem>
                {STAGE_FILTERS.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {t.stages[stage]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {DISPLAY_STATUS_ORDER.map((status) => (
          <div
            key={status}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
          >
            <span
              className={
                status === "finished"
                  ? "h-2 w-2 rounded-full bg-slate-400"
                  : status === "live"
                    ? "h-2 w-2 rounded-full bg-emerald-500"
                    : status === "awaiting_result"
                      ? "h-2 w-2 rounded-full bg-amber-500"
                      : "h-2 w-2 rounded-full bg-emerald-300"
              }
            />
            <span>{t.status[status]}</span>
            <span className="text-slate-950">{statusCounts[status]}</span>
          </div>
        ))}
      </div>

      {groupedMatches.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-slate-300 bg-white shadow-sm">
          <CardContent className="py-8 text-center text-sm text-slate-500 sm:py-12">
            {t.results.noMatches}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {showFinishedResultsSection && (
            <section className="space-y-3 sm:space-y-4">
              <button
                type="button"
                onClick={() => toggleDay(finishedResultsKey, finishedResultsExpanded)}
                aria-expanded={finishedResultsExpanded}
                aria-label={finishedResultsExpanded ? t.results.collapseDay : t.results.expandDay}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:px-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200 sm:h-10 sm:w-10">
                  <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-black tracking-tight text-slate-950 sm:text-xl">
                    {t.results.finishedResults}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">{finishedResultsSummary}</p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${finishedResultsExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {finishedResultsExpanded && (
                <div className="space-y-5 sm:space-y-6">
                  {finishedDateGroups.map((group) => (
                    <div key={group.date} className="space-y-3">
                      <div className="flex items-center justify-between gap-3 px-1">
                        <h3 className="min-w-0 truncate text-sm font-black text-slate-800 sm:text-base">
                          {formatDateHeading(group.date, lang)}
                        </h3>
                        <span className="shrink-0 text-xs font-bold text-slate-500">
                          {group.matches.length}{" "}
                          {group.matches.length === 1 ? t.common.matchesSingular : t.common.matchesPlural}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">{group.matches.map(renderMatchCard)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {visibleDateGroups.map((group) => {
            const defaultExpanded =
              group.statusCounts.live > 0 || group.statusCounts.awaiting_result > 0 || group.date === defaultUpcomingDate
            const expanded = expandedDayOverrides[group.date] ?? defaultExpanded
            const summary = statusSummary(group)

            return (
              <section key={group.date} className="space-y-3 sm:space-y-4">
                <button
                  type="button"
                  onClick={() => toggleDay(group.date, expanded)}
                  aria-expanded={expanded}
                  aria-label={expanded ? t.results.collapseDay : t.results.expandDay}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:px-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 sm:h-10 sm:w-10">
                    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-black tracking-tight text-slate-950 sm:text-xl">
                      {formatDateHeading(group.date, lang)}
                    </h2>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                      {group.matches.length} {group.matches.length === 1 ? t.common.matchesSingular : t.common.matchesPlural}
                      {summary ? <span className="hidden sm:inline"> &middot; {summary}</span> : null}
                    </p>
                    {summary ? <p className="mt-1 text-xs font-medium text-slate-500 sm:hidden">{summary}</p> : null}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>

                {expanded && (
                  <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                    {group.matches.map(renderMatchCard)}
                  </div>
                )}
              </section>
            )
          })}

        </div>
      )}
    </div>
  )
}
