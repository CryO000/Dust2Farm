const SESSION_KEY = "dust2farm-demo-session";

export type DemoSession = {
  mode: "demo";
  name: string;
  email: string;
};

const demoSession: DemoSession = {
  mode: "demo",
  name: "Jordan Miller",
  email: "jordan@hawthorne.demo",
};

export function createDemoSession(remember: boolean) {
  const persistentStorage = window.localStorage;
  const sessionStorage = window.sessionStorage;
  persistentStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  (remember ? persistentStorage : sessionStorage).setItem(
    SESSION_KEY,
    JSON.stringify(demoSession),
  );
}

export function getDemoSession(): DemoSession | null {
  const stored =
    window.localStorage.getItem(SESSION_KEY) ??
    window.sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "mode" in parsed &&
      parsed.mode === "demo" &&
      "name" in parsed &&
      typeof parsed.name === "string" &&
      "email" in parsed &&
      typeof parsed.email === "string"
    ) {
      return parsed as DemoSession;
    }
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  }
  return null;
}

export function clearDemoSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}
