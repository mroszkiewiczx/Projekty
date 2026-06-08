// ============================================================
// src/lib/supabase.ts
// Typed Supabase client — anon key ONLY
// Service role key NIGDY w frontendzie
// ============================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[SalesOS] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
    "Add them to your .env file. Auth will not work."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type SupabaseClient = typeof supabase;
