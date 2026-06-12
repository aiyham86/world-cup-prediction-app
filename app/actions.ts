"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { hasMatchStarted } from "@/lib/match-status"
import { scorePrediction } from "@/lib/scoring"
import type { Lang, MatchComment, MatchReaction, ReactionType } from "@/lib/types"

type SubmitResult = { ok: true } | { ok: false; error: string }
type PredictedMatchIdsResult = { ok: true; matchIds: string[] } | { ok: false; error: string }
type ReactionResult = { ok: true; reaction: MatchReaction } | { ok: false; error: string }
type CommentResult = { ok: true; comment: MatchComment } | { ok: false; error: string }

const messages = {
  en: {
    duplicate: "You have already submitted a prediction for this match.",
    locked: "Predictions for this match are already locked.",
    matchStarted: "Match already started.",
    penaltyWinnerRequired: "Please choose who advances after penalties.",
    generic: "Something went wrong. Please try again.",
  },
  de: {
    duplicate: "Du hast für dieses Spiel bereits einen Tipp abgegeben.",
    locked: "Tipps für dieses Spiel sind bereits gesperrt.",
    matchStarted: "Spiel hat bereits begonnen.",
    penaltyWinnerRequired: "Bitte wähle aus, wer im Elfmeterschießen weiterkommt.",
    generic: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
  },
}

const reactionTypes = new Set<ReactionType>(["like", "love", "funny", "surprised"])

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
  predictedPenaltyWinner?: string | null
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
    .select("id, status, match_date, match_time, stage_en, home_team_en, away_team_en")
    .eq("id", input.matchId)
    .single()

  if (matchError || !match) return { ok: false, error: m.generic }
  if (match.status !== "upcoming") return { ok: false, error: m.locked }
  if (hasMatchStarted(match)) return { ok: false, error: m.matchStarted }

  const isKnockout = match.stage_en !== "Group Stage"
  const predictedDraw = input.homeScore === input.awayScore
  const predictedPenaltyWinner =
    isKnockout && predictedDraw ? (input.predictedPenaltyWinner ?? null) : null

  if (
    isKnockout &&
    predictedDraw &&
    predictedPenaltyWinner !== match.home_team_en &&
    predictedPenaltyWinner !== match.away_team_en
  ) {
    return { ok: false, error: m.penaltyWinnerRequired }
  }

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
    predicted_penalty_winner: predictedPenaltyWinner,
    points: 0,
    is_exact_score: false,
    is_correct_outcome: false,
    updated_at: new Date().toISOString(),
  })

  if (insertError) return { ok: false, error: m.generic }

  return { ok: true }
}

export async function getPredictedMatchIdsForEmployee(input: {
  firstName: string
  lastName: string
}): Promise<PredictedMatchIdsResult> {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  if (!firstName || !lastName) {
    return { ok: true, matchIds: [] }
  }

  const supabase = await createClient()

  const { data: existingEmployees, error: employeeSearchError } = await supabase
    .from("employees")
    .select("id")
    .ilike("first_name", firstName)
    .ilike("last_name", lastName)
    .limit(1)

  if (employeeSearchError) return { ok: false, error: "generic" }

  const employeeId = existingEmployees?.[0]?.id
  if (!employeeId) return { ok: true, matchIds: [] }

  const { data: predictions, error: predictionSearchError } = await supabase
    .from("predictions")
    .select("match_id")
    .eq("employee_id", employeeId)

  if (predictionSearchError) return { ok: false, error: "generic" }

  return {
    ok: true,
    matchIds: Array.from(new Set((predictions ?? []).map((prediction) => prediction.match_id as string))),
  }
}

export async function saveMatchReaction(input: {
  matchId: string
  participantName: string
  reactionType: ReactionType
}): Promise<ReactionResult> {
  const participantName = input.participantName.trim()

  if (!participantName || !reactionTypes.has(input.reactionType)) {
    return { ok: false, error: "generic" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("match_reactions")
    .upsert(
      {
        match_id: input.matchId,
        participant_name: participantName,
        reaction_type: input.reactionType,
      },
      { onConflict: "match_id,participant_name" }
    )
    .select("*")
    .single()

  if (error || !data) return { ok: false, error: "generic" }

  return { ok: true, reaction: data as MatchReaction }
}

export async function postMatchComment(input: {
  matchId: string
  participantName: string
  comment: string
  parentCommentId?: string | null
}): Promise<CommentResult> {
  const participantName = input.participantName.trim()
  const comment = input.comment.trim()
  const parentCommentId = input.parentCommentId ?? null

  if (!participantName || !comment || comment.length > 300) {
    return { ok: false, error: "generic" }
  }

  const supabase = await createClient()

  if (parentCommentId) {
    const { data: parentComment, error: parentError } = await supabase
      .from("match_comments")
      .select("id, match_id, parent_comment_id, is_hidden")
      .eq("id", parentCommentId)
      .eq("match_id", input.matchId)
      .eq("is_hidden", false)
      .single()

    if (parentError || !parentComment || parentComment.parent_comment_id) {
      return { ok: false, error: "generic" }
    }
  }

  const { data, error } = await supabase
    .from("match_comments")
    .insert({
      match_id: input.matchId,
      participant_name: participantName,
      comment,
      parent_comment_id: parentCommentId,
    })
    .select("*")
    .single()

  if (error || !data) return { ok: false, error: "generic" }

  return { ok: true, comment: data as MatchComment }
}

export async function saveMatchResult(input: {
  matchId: string
  homeScore: number
  awayScore: number
  status: "upcoming" | "live" | "finished"
  penaltyWinner?: string | null
}): Promise<SubmitResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "unauthorized" }
  }

  const supabase = await createClient()

  const isFinished = input.status === "finished"

  const { data: existingMatch, error: existingMatchError } = await supabase
    .from("matches")
    .select("id, stage_en, home_team_en, away_team_en")
    .eq("id", input.matchId)
    .single()

  if (existingMatchError || !existingMatch) return { ok: false, error: "generic" }

  const isKnockout = existingMatch.stage_en !== "Group Stage"
  const resultDraw = input.homeScore === input.awayScore
  const penaltyWinner = isFinished && isKnockout && resultDraw ? (input.penaltyWinner ?? null) : null

  if (
    isFinished &&
    isKnockout &&
    resultDraw &&
    penaltyWinner !== existingMatch.home_team_en &&
    penaltyWinner !== existingMatch.away_team_en
  ) {
    return { ok: false, error: "penaltyWinnerRequired" }
  }

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      home_score: isFinished ? input.homeScore : input.status === "live" ? input.homeScore : null,
      away_score: isFinished ? input.awayScore : input.status === "live" ? input.awayScore : null,
      penalty_winner: penaltyWinner,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.matchId)

  if (matchError) return { ok: false, error: "generic" }

  if (isFinished) {
    const { data: predictions, error: predError } = await supabase
      .from("predictions")
      .select("id, predicted_home_score, predicted_away_score, predicted_penalty_winner")
      .eq("match_id", input.matchId)

    if (predError) return { ok: false, error: "generic" }

    for (const p of predictions ?? []) {
      const result = scorePrediction(
        p.predicted_home_score,
        p.predicted_away_score,
        input.homeScore,
        input.awayScore,
        {
          isKnockout,
          predictedPenaltyWinner: p.predicted_penalty_winner,
          actualPenaltyWinner: penaltyWinner,
        },
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
