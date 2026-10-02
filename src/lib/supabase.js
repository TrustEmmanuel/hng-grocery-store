import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function usable(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/your[-_]|YOUR_PROJECT|placeholder/i.test(trimmed)) return false;
  return true;
}

export const supabaseUrl = usable(url) ? url.trim().replace(/\/$/, "") : "";
export const supabaseAnonKey = usable(anonKey) ? anonKey.trim() : "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export function functionsBase() {
  return supabaseUrl ? `${supabaseUrl}/functions/v1` : "";
}
