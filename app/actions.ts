"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { scorePrediction } from "@/lib/scoring"
import type { Lang } from "@/lib/types"

type SubmitResult = { ok: true } | { ok: false; error: string }

const messages = {
  en: {
    duplicate: "You have already submitted a prediction for this match.",
    locked: "Predictions for this match are already locked.",
    generic: "Something went wrong. Please try again.",
  },
  de: {
    duplicate: "Du hast für dieses Spiel bereits einen Tipp abgegeben.",
    locked: "Tipps für dieses Spiel sind bereits gesperrt.",
    generic: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
  },
}

async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "true"
}

export async function adminLogin(password: string): Promise<SubmitResult> {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { ok: false, error: "Invalid password" }
  }

  const cookieStore = await cookies()
  cookieStore.set("admin_auth", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  return { ok: true }
}

export async function adminLogout(): Promise<SubmitResult> {
  const cookieStore = await cookies()
  cookieStore.set("admin_auth", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return { ok: true }
}

export async function submitPrediction(input: {
  firstName: string
  lastName: string
  department: string
  matchId: string
  homeScore: number
  awayScore: number
  lang: Lang
}): Promise<SubmitResult> {
  const m = messages[input.lang]
  const supabase = await createClient()

  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const department = input.department.trim() || "Other"

  // Verify match is still upcoming
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, status")
    .eq("id", input.matchId)
    .single()

  if (matchError || !match) return { ok: false, error: m.generic }
  if (match.status !== "upcoming") return { ok: false, error: m.locked }

  // Find existing employee by first name + last name
  const { data: existingEmployees, error: employeeSearchError } = await supabase
    .from("employees")
    .select("id")
    .ilike("first_name", firstName)
    .ilike("last_name", lastName)
    .limit(1)

  if (employeeSearchError) return { ok: false, error: m.generic }

  let employeeId = existingEmployees?.[0]?.id

  // Create employee automatically if name does not exist yet
  if (!employeeId) {
    const { data: newEmployee, error: employeeInsertError } = await supabase
      .from("employees")
      .insert({
        first_name: firstName,
        last_name: lastName,
        department,
        pin: "",
      })
      .select("id")
      .single()

    if (employeeInsertError || !newEmployee) return { ok: false, error: m.generic }

    employeeId = newEmployee.id
  }

  // Refuse duplicate prediction for the same employee and match
  const { data: existingPrediction, error: predictionSearchError } = await supabase
    .from("predictions")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("match_id", input.matchId)
    .limit(1)

  if (predictionSearchError) return { ok: false, error: m.generic }

  if (existingPrediction && existingPrediction.length > 0) {
    return { ok: false, error: m.duplicate }
  }

  // Insert new prediction
  const { error: insertError } = await supabase.from("predictions").insert({
    employee_id: employeeId,
    match_id: input.matchId,
    predicted_home_score: input.homeScore,
    predicted_away_score: input.awayScore,
    points: 0,
    is_exact_score: false,
    is_correct_outcome: false,
    updated_at: new Date().toISOString(),
  })

  if (insertError) return { ok: false, error: m.generic }

  return { ok: true }
}

export async function saveMatchResult(input: {
  matchId: string
  homeScore: number
  awayScore: number
  status: "upcoming" | "live" | "finished"
}): Promise<SubmitResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "unauthorized" }
  }

  const supabase = await createClient()

  const isFinished = input.status === "finished"

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      home_score: isFinished ? input.homeScore : input.status === "live" ? input.homeScore : null,
      away_score: isFinished ? input.awayScore : input.status === "live" ? input.awayScore : null,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.matchId)

  if (matchError) return { ok: false, error: "generic" }

  if (isFinished) {
    const { data: predictions, error: predError } = await supabase
      .from("predictions")
      .select("id, predicted_home_score, predicted_away_score")
      .eq("match_id", input.matchId)

    if (predError) return { ok: false, error: "generic" }

    for (const p of predictions ?? []) {
      const result = scorePrediction(
        p.predicted_home_score,
        p.predicted_away_score,
        input.homeScore,
        input.awayScore,
      )

      await supabase
        .from("predictions")
        .update({
          points: result.points,
          is_exact_score: result.isExactScore,
          is_correct_outcome: result.isCorrectOutcome,
          updated_at: new Date().toISOString(),
        })
        .eq("id", p.id)
    }
  } else {
    await supabase
      .from("predictions")
      .update({
        points: 0,
        is_exact_score: false,
        is_correct_outcome: false,
      })
      .eq("match_id", input.matchId)
  }

  return { ok: true }
}
