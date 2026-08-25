import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function isValidSupabaseKey(key: string | undefined): boolean {
  return !!key && key.startsWith("eyJ") && key.length > 100;
}

export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  isValidSupabaseKey(supabaseAnonKey);

export const isSupabaseAdminConfigured =
  isSupabaseConfigured && isValidSupabaseKey(supabaseServiceKey);

if (process.env.NODE_ENV !== "production" && !isSupabaseConfigured) {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured."
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://invalid.supabase.co",
  supabaseAnonKey || "",
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      persistSession: true,
    },
  }
);

export const supabaseAdmin: SupabaseClient = isSupabaseAdminConfigured
  ? createClient(supabaseUrl || "https://invalid.supabase.co", supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;
