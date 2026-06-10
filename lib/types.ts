export type Lang = "en" | "de"

export type Employee = {
  id: string
  first_name: string
  last_name: string
  department: string
  pin: string
  created_at: string
}

export type Match = {
  id: string
  match_number: number
  home_team_en: string
  away_team_en: string
  home_team_de: string
  away_team_de: string
  match_date: string
  match_time: string | null
  stage_en: string
  stage_de: string
  home_score: number | null
  away_score: number | null
  status: "upcoming" | "live" | "finished"
  created_at: string
  updated_at: string
}

export type Prediction = {
  id: string
  employee_id: string
  match_id: string
  predicted_home_score: number
  predicted_away_score: number
  points: number
  is_exact_score: boolean
  is_correct_outcome: boolean
  created_at: string
  updated_at: string
}
