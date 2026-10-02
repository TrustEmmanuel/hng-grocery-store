import { optionsResponse, json } from "../_shared/http.ts";
import { adminClient, upsertUser, verifyGoogleIdToken } from "../_shared/google.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { credential } = await req.json();
    const profile = await verifyGoogleIdToken(credential);
    const user = await upsertUser(adminClient(), profile);
    return json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign-in failed";
    return json({ error: message }, 400);
  }
});
