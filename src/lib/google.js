const SESSION_KEY = "tajmart.session";

let scriptPromise;

export function loadGoogleIdentity() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-tajmart-gsi="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("Google sign-in failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.tajmartGsi = "1";
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Google sign-in failed to load"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function decodeJwt(token) {
  const segment = token.split(".")[1];
  if (!segment) throw new Error("Invalid Google credential");
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
  return JSON.parse(json);
}

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.credential || !session?.email) return null;
    if (!sessionValid(session)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function sessionValid(session) {
  if (!session?.exp) return false;
  return session.exp * 1000 > Date.now() + 30_000;
}

export function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  try {
    window.google?.accounts?.id?.disableAutoSelect?.();
  } catch {
    /* ignore */
  }
}

export function googleClientId() {
  const value = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!value || /your-client-id|your-id/i.test(value)) return "";
  return value.trim();
}
