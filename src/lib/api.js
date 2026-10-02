import { functionsBase, supabaseAnonKey } from "./supabase";

async function callFunction(name, payload) {
  const base = functionsBase();
  if (!base || !supabaseAnonKey) {
    const error = new Error(
      "Supabase is not configured yet. Add the project URL and anon key to .env.",
    );
    error.code = "not_configured";
    throw error;
  }

  const response = await fetch(`${base}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function persistGoogleUser(credential) {
  return callFunction("google-signin", { credential });
}

export function placeOrder(payload) {
  return callFunction("place-order", payload);
}
