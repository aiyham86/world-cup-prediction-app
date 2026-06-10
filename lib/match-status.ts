import type { Match } from "@/lib/types"

export type DisplayMatchStatus = Match["status"] | "awaiting_result"

const ZURICH_TIME_ZONE = "Europe/Zurich"
const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  )

  const zonedTimeAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  )

  return zonedTimeAsUtc - date.getTime()
}

export function getKickoffDate(match: Pick<Match, "match_date" | "match_time">) {
  if (!match.match_time) return null

  const [year, month, day] = match.match_date.split("-").map(Number)
  const [hour = 0, minute = 0, second = 0] = match.match_time.split(":").map(Number)
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second)
  const offset = getTimeZoneOffsetMs(new Date(utcGuess), ZURICH_TIME_ZONE)

  return new Date(utcGuess - offset)
}

export function hasMatchStarted(
  match: Pick<Match, "match_date" | "match_time">,
  now = new Date(),
) {
  const kickoff = getKickoffDate(match)
  return kickoff ? now.getTime() >= kickoff.getTime() : false
}

export function getDisplayMatchStatus(
  match: Pick<Match, "status" | "match_date" | "match_time">,
  now = new Date(),
): DisplayMatchStatus {
  if (match.status === "finished" || match.status === "live") return match.status

  const kickoff = getKickoffDate(match)
  if (!kickoff || now.getTime() < kickoff.getTime()) return "upcoming"

  return now.getTime() <= kickoff.getTime() + LIVE_WINDOW_MS ? "live" : "awaiting_result"
}
