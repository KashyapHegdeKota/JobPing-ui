import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { FirebaseApp } from "firebase/app";

let ownedApp: FirebaseApp | undefined;

afterEach(async () => {
  cleanup();
  if (ownedApp) {
    const { deleteApp } = await import("firebase/app");
    await deleteApp(ownedApp);
    ownedApp = undefined;
  }
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("restores a real Firebase session three days after browser restart, refreshes its token and honors sign-out", async () => {
  vi.resetModules();
  localStorage.clear();
  for (const [name, value] of Object.entries({
    NEXT_PUBLIC_FIREBASE_API_KEY: "session-test-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "session-test.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "session-test",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "session-test.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234",
    NEXT_PUBLIC_FIREBASE_APP_ID: "session-test-app",
  })) vi.stubEnv(name, value);

  let now = new Date("2026-10-13T12:00:00Z").getTime();
  vi.spyOn(Date, "now").mockImplementation(() => now);
  const token = () => {
    const issued = Math.floor(now / 1000);
    return `${btoa(JSON.stringify({ alg: "none" }))}.${btoa(JSON.stringify({ sub: "returning-user", iat: issued, exp: issued + 3600, auth_time: issued }))}.fixture`;
  };
  const requests: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    requests.push(url);
    if (url.startsWith("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?")) return Response.json({ localId: "returning-user", email: "returning@example.com", idToken: token(), refreshToken: "fixture-refresh-token", expiresIn: "3600" });
    if (url.startsWith("https://securetoken.googleapis.com/v1/token?")) return Response.json({ user_id: "returning-user", access_token: token(), refresh_token: "fixture-refresh-token", expires_in: "3600" });
    if (url.startsWith("https://identitytoolkit.googleapis.com/v1/accounts:lookup?")) return Response.json({ users: [{ localId: "returning-user", email: "returning@example.com", emailVerified: true, passwordHash: "fixture-hash", providerUserInfo: [{ providerId: "password", email: "returning@example.com" }] }] });
    throw new Error(`Unexpected fixture request: ${url}`);
  }));

  const firebase = await import("./firebase");
  ownedApp = firebase.app;
  await firebase.auth.authStateReady();
  const { default: AuthModal } = await import("../components/AuthModal");
  const completed = vi.fn();
  const dialog = render(<AuthModal isOpen initialMode="signin" onClose={vi.fn()} onAuthenticated={completed} />);
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "returning@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "fixture-password" } });
  fireEvent.submit(screen.getByLabelText("Email").closest("form")!);
  await waitFor(() => expect(completed).toHaveBeenCalledOnce());
  expect(firebase.auth.currentUser?.uid).toBe("returning-user");
  const originalToken = await firebase.auth.currentUser!.getIdToken();
  dialog.unmount();

  const { deleteApp, initializeApp } = await import("firebase/app");
  const { getAuth, signOut } = await import("firebase/auth");
  const options = firebase.app.options;
  await deleteApp(firebase.app);
  ownedApp = undefined;
  sessionStorage.clear();
  now += 3 * 24 * 60 * 60 * 1000;
  ownedApp = initializeApp(options);
  const restored = getAuth(ownedApp);
  await restored.authStateReady();
  expect(restored.currentUser?.uid).toBe("returning-user");
  expect(await restored.currentUser!.getIdToken()).not.toBe(originalToken);
  expect(requests.some(url => url.startsWith("https://securetoken.googleapis.com/"))).toBe(true);

  await signOut(restored);
  await deleteApp(ownedApp);
  ownedApp = initializeApp(options);
  const signedOut = getAuth(ownedApp);
  await signedOut.authStateReady();
  expect(signedOut.currentUser).toBeNull();
}, 15_000);
