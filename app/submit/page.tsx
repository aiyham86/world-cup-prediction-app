import { createClient } from "@/lib/supabase/server"
import type { Match } from "@/lib/types"
import { SubmitForm } from "@/components/submit-form"

export const dynamic = "force-dynamic"

export default async function SubmitPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("matches")
    .select("*")
    .order("match_number", { ascending: true })

  const matches = (data ?? []) as Match[]

  return <SubmitForm matches={matches} />
}