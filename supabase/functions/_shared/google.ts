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

function jwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

type GoogleIdentity = {
  provider?: string;
  provider_id?: string;
  identity_data?: { sub?: string };
};

async function verifySupabaseAccessToken(accessToken: string): Promise<GoogleProfile> {
  const { data, error } = await adminClient().auth.getUser(accessToken);
  if (error || !data.user?.email) throw new Error("Google could not verify that sign-in");
  const meta = data.user.user_metadata ?? {};
  const identities = (data.user.identities || []) as GoogleIdentity[];
  const google = identities.find((item) => item.provider === "google");
  const sub = String(google?.identity_data?.sub || google?.provider_id || meta.provider_id || meta.sub || "");
  if (!sub) throw new Error("Google did not return a verified email");
  return {
    sub,
    email: data.user.email,
    name: String(meta.full_name || meta.name || data.user.email),
  };
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const claims = jwtPayload(idToken);
  if (String(claims?.iss || "").includes("supabase.co")) {
    return verifySupabaseAccessToken(idToken);
  }

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

const USER_COLUMNS = "id, google_id, name, email, created_at";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type UserRow = {
  id: string;
  google_id: string;
  name: string;
  email: string;
  created_at: string;
};

function escapeIlike(value: string) {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}

async function mergeCarts(admin: SupabaseClient, canonicalId: string, otherIds: string[]) {
  if (!otherIds.length) return;
  const { data, error } = await admin
    .from("cart_items")
    .select("id, product_id, quantity")
    .in("user_id", otherIds);
  if (error) throw new Error(error.message);

  for (const row of data || []) {
    const { data: existing, error: existingError } = await admin
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", canonicalId)
      .eq("product_id", row.product_id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    const quantity = Math.min(12, (existing?.quantity || 0) + Number(row.quantity || 0));
    if (existing) {
      const { error: updateError } = await admin.from("cart_items").update({ quantity }).eq("id", existing.id);
      if (updateError) throw new Error(updateError.message);
    } else {
      const { error: insertError } = await admin
        .from("cart_items")
        .insert({ user_id: canonicalId, product_id: row.product_id, quantity });
      if (insertError) throw new Error(insertError.message);
    }

    const { error: deleteError } = await admin.from("cart_items").delete().eq("id", row.id);
    if (deleteError) throw new Error(deleteError.message);
  }
}

export async function upsertUser(admin: SupabaseClient, profile: GoogleProfile) {
  const email = profile.email.trim();
  const { data: byGoogle, error: googleError } = await admin
    .from("users")
    .select(USER_COLUMNS)
    .eq("google_id", profile.sub)
    .maybeSingle();
  if (googleError) throw new Error(googleError.message);

  const { data: byEmail, error: emailError } = await admin
    .from("users")
    .select(USER_COLUMNS)
    .ilike("email", escapeIlike(email))
    .order("created_at", { ascending: true });
  if (emailError) throw new Error(emailError.message);

  const matches = (byEmail || []) as UserRow[];
  const canonical = (byGoogle as UserRow | null) || matches.find((user) => !UUID.test(user.google_id)) || matches[0];

  if (!canonical) {
    const { data, error } = await admin
      .from("users")
      .upsert(
        { google_id: profile.sub, name: profile.name, email },
        { onConflict: "google_id" },
      )
      .select(USER_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const googleId = !UUID.test(profile.sub) && UUID.test(canonical.google_id) ? profile.sub : canonical.google_id;
  const { data: updated, error: updateError } = await admin
    .from("users")
    .update({ google_id: googleId, name: profile.name, email })
    .eq("id", canonical.id)
    .select(USER_COLUMNS)
    .single();
  if (updateError) throw new Error(updateError.message);

  await mergeCarts(
    admin,
    canonical.id,
    matches.filter((user) => user.id !== canonical.id).map((user) => user.id),
  );
  return updated;
}
