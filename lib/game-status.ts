/**
 * Retirement switches for the completed 2026 game.
 *
 * Keep the write paths in place for a future tournament, but require an
 * intentional code change before app writes can resume. Supabase RLS remains
 * the database-level security boundary and must be reviewed separately.
 */
export const PUBLIC_PREDICTIONS_ENABLED = false
export const PUBLIC_COMMUNITY_WRITES_ENABLED = false
export const ADMIN_FUNCTIONALITY_ENABLED = false
