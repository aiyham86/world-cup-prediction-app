import type { Metadata } from "next"
import LeaderboardPage from "@/app/leaderboard/page"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "2026 Final Results",
  description: "The read-only final leaderboard and prediction results from the Simex World Cup 2026 Prediction Game.",
}

export default function WorldCup2026ArchivePage() {
  return <LeaderboardPage />
}
