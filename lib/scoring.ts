export type ScoreResult = {
  points: number
  isExactScore: boolean
  isCorrectOutcome: boolean
}

/**
 * Scoring rules:
 * - Exact score: 5 points
 * - Correct outcome (winner or draw): 3 points
 * - Correct goal difference (on top of correct outcome): +1 bonus point
 * - Otherwise: 0 points
 */
export function scorePrediction(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
): ScoreResult {
  const isExactScore = predHome === actualHome && predAway === actualAway
  if (isExactScore) {
    return { points: 5, isExactScore: true, isCorrectOutcome: true }
  }

  const outcome = (h: number, a: number) => (h > a ? "home" : h < a ? "away" : "draw")
  const isCorrectOutcome = outcome(predHome, predAway) === outcome(actualHome, actualAway)

  if (!isCorrectOutcome) {
    return { points: 0, isExactScore: false, isCorrectOutcome: false }
  }

  let points = 3
  const correctGoalDiff = predHome - predAway === actualHome - actualAway
  if (correctGoalDiff) {
    points += 1
  }

  return { points, isExactScore: false, isCorrectOutcome: true }
}
