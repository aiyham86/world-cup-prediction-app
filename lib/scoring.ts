export type ScoreResult = {
  points: number
  isExactScore: boolean
  isCorrectOutcome: boolean
  hasPenaltyWinnerBonus: boolean
}

/**
 * Scoring rules:
 * - Exact score: 5 points
 * - Correct outcome (winner or draw): 3 points
 * - Correct goal difference (on top of correct outcome): +1 bonus point
 * - Correct penalty winner in knockout draw: +1 bonus point
 * - Otherwise: 0 points
 */
export function scorePrediction(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
  options?: {
    isKnockout?: boolean
    predictedPenaltyWinner?: string | null
    actualPenaltyWinner?: string | null
  },
): ScoreResult {
  const hasPenaltyWinnerBonus =
    Boolean(options?.isKnockout) &&
    actualHome === actualAway &&
    predHome === predAway &&
    Boolean(options?.predictedPenaltyWinner) &&
    options?.predictedPenaltyWinner === options?.actualPenaltyWinner

  const isExactScore = predHome === actualHome && predAway === actualAway
  if (isExactScore) {
    return {
      points: 5 + (hasPenaltyWinnerBonus ? 1 : 0),
      isExactScore: true,
      isCorrectOutcome: true,
      hasPenaltyWinnerBonus,
    }
  }

  const outcome = (h: number, a: number) => (h > a ? "home" : h < a ? "away" : "draw")
  const isCorrectOutcome = outcome(predHome, predAway) === outcome(actualHome, actualAway)

  if (!isCorrectOutcome) {
    return { points: 0, isExactScore: false, isCorrectOutcome: false, hasPenaltyWinnerBonus: false }
  }

  let points = 3
  const correctGoalDiff = predHome - predAway === actualHome - actualAway
  if (correctGoalDiff) {
    points += 1
  }
  if (hasPenaltyWinnerBonus) {
    points += 1
  }

  return { points, isExactScore: false, isCorrectOutcome: true, hasPenaltyWinnerBonus }
}
