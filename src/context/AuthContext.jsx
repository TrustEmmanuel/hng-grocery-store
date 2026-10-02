import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { persistGoogleUser } from "../lib/api";
import {
  clearSession,
  decodeJwt,
  readSession,
  writeSession,
} from "../lib/google";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());
  const [signInOpen, setSignInOpen] = useState(false);
  const [authError, setAuthError] = useState("");

  const openSignIn = useCallback(() => {
    setAuthError("");
    setSignInOpen(true);
  }, []);

  const closeSignIn = useCallback(() => setSignInOpen(false), []);

  const completeSignIn = useCallback(async (credential) => {
    const profile = decodeJwt(credential);
    const session = {
      id: null,
      googleId: profile.sub,
      name: profile.name || profile.email,
      email: profile.email,
      picture: profile.picture || "",
      credential,
      exp: profile.exp,
      persisted: false,
    };

    try {
      const result = await persistGoogleUser(credential);
      if (result?.user) {
        session.id = result.user.id;
        session.name = result.user.name || session.name;
        session.email = result.user.email || session.email;
        session.persisted = true;
      }
    } catch (error) {
      if (error.code !== "not_configured" && error.status !== 404) {
        console.warn("Could not store the Google profile yet:", error.message);
      }
    }

    writeSession(session);
    setUser(session);
    setSignInOpen(false);
    return session;
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      signInOpen,
      authError,
      setAuthError,
      openSignIn,
      closeSignIn,
      completeSignIn,
      signOut,
    }),
    [user, signInOpen, authError, openSignIn, closeSignIn, completeSignIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
