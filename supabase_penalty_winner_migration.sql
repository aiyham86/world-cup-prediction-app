alter table predictions
  add column if not exists predicted_penalty_winner text null;

alter table matches
  add column if not exists penalty_winner text null;
