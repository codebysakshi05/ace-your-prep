// Mock auth — UI-only scaffold. Swap with real backend later.
export type MockUser = { name: string; email: string };

const KEY = "aceitup_user";

export function getUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: MockUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("aceitup-auth"));
}

export function clearUser() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("aceitup-auth"));
}
