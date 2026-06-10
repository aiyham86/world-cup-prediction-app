import { createClient } from "@/lib/supabase/server"
import type { Match } from "@/lib/types"
import { ResultsView } from "@/components/results-view"

export const dynamic = "force-dynamic"

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from("matches").select("*").order("match_number", { ascending: true })
  const matches = (data ?? []) as Match[]

  return <ResultsView matches={matches} />
}
