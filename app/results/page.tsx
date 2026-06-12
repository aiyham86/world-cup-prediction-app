import { createClient } from "@/lib/supabase/server"
import type { Employee, Match, MatchComment, MatchReaction, Prediction } from "@/lib/types"
import { ResultsView } from "@/components/results-view"

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

export default async function ResultsPage() {
  const supabase = await createClient()
  const [{ data }, employees, predictions, reactions, comments] = await Promise.all([
    supabase.from("matches").select("*").order("match_number", { ascending: true }),
    fetchAllRows<Employee>(async (from, to) =>
      supabase.from("employees").select("*").order("created_at", { ascending: true }).range(from, to)
    ),
    fetchAllRows<Prediction>(async (from, to) =>
      supabase.from("predictions").select("*").order("created_at", { ascending: true }).range(from, to)
    ),
    fetchAllRows<MatchReaction>(async (from, to) =>
      supabase.from("match_reactions").select("*").order("created_at", { ascending: true }).range(from, to)
    ).catch(() => []),
    fetchAllRows<MatchComment>(async (from, to) =>
      supabase
        .from("match_comments")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: true })
        .range(from, to)
    ).catch(() => []),
  ])
  const matches = (data ?? []) as Match[]

  return (
    <ResultsView
      matches={matches}
      totalEmployees={employees.length}
      predictions={predictions}
      reactions={reactions}
      comments={comments}
    />
  )
}
