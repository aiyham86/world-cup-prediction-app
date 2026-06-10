import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { Match } from "@/lib/types"
import { AdminForm } from "@/components/admin-form"
import { AdminLoginForm } from "@/components/admin-login-form"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_auth")?.value === "true"

  if (!isAuthenticated) {
    return <AdminLoginForm />
  }

  const supabase = await createClient()
  const { data } = await supabase.from("matches").select("*").order("match_number", { ascending: true })
  const matches = (data ?? []) as Match[]

  return <AdminForm matches={matches} />
}
