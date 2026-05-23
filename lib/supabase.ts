import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────
// Supabase Client Configuration
// ────────────────────────────────────────────
//
// Two clients are available:
//
// 1. `supabase` (anon key) — for client-side reads and
//    operations where RLS should apply.
//
// 2. `supabaseAdmin` (service role key) — for server-side
//    API routes where we need to bypass RLS. This key must
//    NEVER be exposed to the client (no NEXT_PUBLIC_ prefix).
// ────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Check if Supabase credentials look valid.
 * Real Supabase anon/service keys are JWTs starting with "eyJ".
 */
function isValidSupabaseKey(key: string | undefined): boolean {
  return !!key && key.startsWith("eyJ") && key.length > 100;
}

/** Whether Supabase is properly configured for client operations */
export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl.includes("supabase.co") &&
  isValidSupabaseKey(supabaseAnonKey);

/** Whether Supabase admin (service role) is configured for server operations */
export const isSupabaseAdminConfigured =
  isSupabaseConfigured && isValidSupabaseKey(supabaseServiceKey);

/**
 * Public Supabase client — uses anon key, respects RLS.
 * Safe for client-side and server-side read operations.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "eyJ-placeholder",
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      persistSession: true,
    },
  }
);

/**
 * Admin Supabase client — uses service role key, bypasses RLS.
 * Use ONLY in server-side API routes, NEVER in client components.
 * Falls back to anon client if service role key is not configured.
 */
export const supabaseAdmin: SupabaseClient = supabaseServiceKey
  ? createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;
