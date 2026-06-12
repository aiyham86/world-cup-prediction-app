import { createClient } from "@/lib/supabase/server"
import type { Employee, Match, Prediction } from "@/lib/types"
import { LeaderboardView, type LeaderboardRow } from "@/components/leaderboard-view"

export const dynamic = "force-dynamic"

async function fetchAllRows<T>(
  queryFactory: (from: number, to: number) => Promise<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const pageSize = 1000
  let from = 0
  const all: T[] = []

  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await queryFactory(from, to)

    if (error) throw error

    const batch = data ?? []
    all.push(...batch)

    if (batch.length < pageSize) break
    from += pageSize
  }

  return all
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const [employeesData, predictionsData, { data: matchesData }] = await Promise.all([
    fetchAllRows<Employee>(async (from, to) =>
      supabase.from("employees").select("*").order("created_at", { ascending: true }).range(from, to)
    ),
    fetchAllRows<Prediction>(async (from, to) =>
      supabase.from("predictions").select("*").order("created_at", { ascending: true }).range(from, to)
    ),
    supabase.from("matches").select("*"),
  ])

  const employees = employeesData
  const predictions = predictionsData
  const matches = (matchesData ?? []) as Match[]
  const matchById = new Map(matches.map((match) => [match.id, match]))

  const byEmployee = new Map<string, Prediction[]>()
  for (const p of predictions) {
    const list = byEmployee.get(p.employee_id) ?? []
    list.push(p)
    byEmployee.set(p.employee_id, list)
  }

  const rows: LeaderboardRow[] = employees
    .map((emp) => {
      const preds = byEmployee.get(emp.id) ?? []
      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department,
        displayRank: 0,
        points: preds.reduce((sum, p) => sum + p.points, 0),
        exactScores: preds.filter((p) => p.is_exact_score).length,
        correctOutcomes: preds.filter((p) => p.is_correct_outcome).length,
        predictions: preds.length,
        predictionsList: preds
          .map((prediction) => {
            const match = matchById.get(prediction.match_id)
            if (!match) return null

            return {
              id: prediction.id,
              matchNumber: match.match_number,
              homeTeamEn: match.home_team_en,
              homeTeamDe: match.home_team_de,
              awayTeamEn: match.away_team_en,
              awayTeamDe: match.away_team_de,
              predictedHomeScore: prediction.predicted_home_score,
              predictedAwayScore: prediction.predicted_away_score,
              predictedPenaltyWinner: prediction.predicted_penalty_winner,
              actualHomeScore: match.home_score,
              actualAwayScore: match.away_score,
              actualPenaltyWinner: match.penalty_winner,
              matchStatus: match.status,
              points: prediction.points,
              isExactScore: prediction.is_exact_score,
              isCorrectOutcome: prediction.is_correct_outcome,
            }
          })
          .filter((prediction): prediction is NonNullable<typeof prediction> => prediction !== null)
          .sort((a, b) => a.matchNumber - b.matchNumber),
      }
    })
    .filter((r) => r.predictions > 0)
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.exactScores - a.exactScores ||
        b.correctOutcomes - a.correctOutcomes ||
        a.name.localeCompare(b.name)
    )

  let currentRank = 0
  for (let index = 0; index < rows.length; index += 1) {
    const previous = rows[index - 1]
    const current = rows[index]
    const tiedWithPrevious =
      previous &&
      previous.points === current.points &&
      previous.exactScores === current.exactScores &&
      previous.correctOutcomes === current.correctOutcomes

    if (!tiedWithPrevious) {
      currentRank += 1
    }

    current.displayRank = currentRank
  }

  const hasRealLeader = rows.length > 0 && rows[0].points > 0

  // Best department by total points
  const deptPoints = new Map<string, number>()
  for (const r of rows) {
    deptPoints.set(r.department, (deptPoints.get(r.department) ?? 0) + r.points)
  }
  let bestDepartment: string | null = null
  let bestDeptPoints = -1
  for (const [dept, pts] of deptPoints) {
    if (pts > bestDeptPoints) {
      bestDeptPoints = pts
      bestDepartment = dept
    }
  }
  if (bestDeptPoints <= 0) {
    bestDepartment = null
  }

  return (
    <LeaderboardView
      rows={rows}
      totalPredictions={predictions.length}
      bestDepartment={bestDepartment}
      hasRealLeader={hasRealLeader}
    />
  )
}
