import { useSyncExternalStore } from "react";

const STORAGE_KEY = "serbian-pronouns-highscores";
const LIMIT = 10;

export interface HighScore {
  score: number;
  date: number;
}

const empty: HighScore[] = [];
const listeners = new Set<() => void>();

// useSyncExternalStore needs a stable snapshot, so re-parse only when the raw
// string in storage actually changes.
let cachedRaw: string | null = null;
let cached: HighScore[] = empty;

function read(): HighScore[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — behave as if empty.
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = JSON.parse(raw ?? "[]");
      cached = Array.isArray(parsed)
        ? parsed.filter((entry) => typeof entry?.score === "number" && typeof entry?.date === "number")
        : empty;
    } catch {
      cached = empty;
    }
  }
  return cached;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function addHighScore(entry: HighScore): void {
  const list = [...read(), entry]
    .sort((a, b) => b.score - a.score || a.date - b.date)
    .slice(0, LIMIT);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // The score just won't be remembered.
  }
  listeners.forEach((listener) => listener());
}

export function useHighScores(): HighScore[] {
  return useSyncExternalStore(subscribe, read, () => empty);
}
