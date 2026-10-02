import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
};

export function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase service role is not available in this function");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not set on the function");
  if (!idToken) throw new Error("Missing Google credential");

  const response = await fetch("https://oauth2.googleapis.com/tokeninfo", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken }),
  });

  if (!response.ok) throw new Error("Google could not verify that sign-in");

  const payload = await response.json();
  if (payload.aud !== clientId) throw new Error("That Google sign-in was issued for a different app");

  const verified = payload.email_verified === true || payload.email_verified === "true";
  if (!verified || !payload.email || !payload.sub) {
    throw new Error("Google did not return a verified email");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || payload.email,
  };
}

export async function upsertUser(admin: SupabaseClient, profile: GoogleProfile) {
  const { data, error } = await admin
    .from("users")
    .upsert(
      { google_id: profile.sub, name: profile.name, email: profile.email },
      { onConflict: "google_id" },
    )
    .select("id, google_id, name, email, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
