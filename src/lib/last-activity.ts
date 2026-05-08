const KEY = "ciao_last_activity";

export type LastActivity = { to: string; label: string };

export function setLastActivity(a: LastActivity) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    // ignore
  }
}

export function getLastActivity(): LastActivity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastActivity;
  } catch {
    return null;
  }
}