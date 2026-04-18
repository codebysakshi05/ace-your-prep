// Mock progress tracking via localStorage.
export type ModuleKey = "aptitude" | "gd" | "communication" | "interview";

export type ProgressEntry = {
  module: ModuleKey;
  score: number; // 0-100
  detail?: string;
  at: number;
};

const KEY = "aceitup_progress";

export function getProgress(): ProgressEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as ProgressEntry[];
  } catch {
    return [];
  }
}

export function addProgress(entry: Omit<ProgressEntry, "at">) {
  const list = getProgress();
  list.push({ ...entry, at: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("aceitup-progress"));
}

export function moduleStats(list: ProgressEntry[], key: ModuleKey) {
  const items = list.filter((e) => e.module === key);
  if (items.length === 0) return { attempts: 0, avg: 0, best: 0 };
  const avg = Math.round(items.reduce((a, b) => a + b.score, 0) / items.length);
  const best = Math.max(...items.map((e) => e.score));
  return { attempts: items.length, avg, best };
}
