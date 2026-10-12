import { rememberCooldown } from "./requestCooldown";

export const authCooldownScope = "interactive-auth";

export function authenticationMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : null;
  if (code === "auth/too-many-requests") {
    rememberCooldown(authCooldownScope, Date.now() + 60_000);
    return "Too many sign-in attempts. Please wait one minute and try again.";
  }
  if (["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password", "auth/email-already-in-use"].includes(String(code))) {
    return "Could not complete sign-in. Check your details or try another sign-in method.";
  }
  if (code === "auth/network-request-failed") return "Could not connect. Check your connection and try again.";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "Sign-in was cancelled. Please try again when ready.";
  // Avoid exposing raw provider responses that can reveal account state.
  return "Could not complete sign-in. Please try again.";
}
