import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { googleClientId, loadGoogleIdentity } from "../lib/google";
import { IconClose } from "./Icons";

export function SignInDialog() {
  const { signInOpen, closeSignIn, completeSignIn, authError, setAuthError } = useAuth();
  const buttonRef = useRef(null);
  const clientId = googleClientId();

  useEffect(() => {
    if (!signInOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") closeSignIn();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [signInOpen, closeSignIn]);

  useEffect(() => {
    if (!signInOpen || !clientId) return undefined;
    const slot = buttonRef.current;
    if (!slot) return undefined;
    let cancelled = false;

    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !buttonRef.current) return;
        buttonRef.current.innerHTML = "";
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              await completeSignIn(response.credential);
            } catch (error) {
              setAuthError(error.message || "Google sign-in failed");
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "signin_with",
          logo_alignment: "left",
          width: 320,
        });
      })
      .catch((error) => setAuthError(error.message));

    return () => {
      cancelled = true;
      if (slot) slot.innerHTML = "";
    };
  }, [signInOpen, clientId, completeSignIn, setAuthError]);

  if (!signInOpen) return null;

  return (
    <div className="backdrop" onMouseDown={closeSignIn}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <h2 id="signin-title">Sign in to TajMart</h2>
          <button type="button" className="icon-btn" onClick={closeSignIn} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <p className="dialog-copy">
          Google confirms who the order belongs to. We store your name, email, and Google ID, then send the receipt to that inbox.
        </p>
        {clientId ? (
          <div className="google-slot" ref={buttonRef} />
        ) : (
          <p className="form-error">
            Add <code>VITE_GOOGLE_CLIENT_ID</code> to <code>.env</code> and restart the dev server. In Google Cloud Console, create a Web client and allow this site under Authorized JavaScript origins.
          </p>
        )}
        {authError && <p className="form-error">{authError}</p>}
      </div>
    </div>
  );
}
