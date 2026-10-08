import { useEffect, useState, useSyncExternalStore } from "react";

export const currencies = [
  { code: "RUB", name: "Российский рубль" },
  { code: "EUR", name: "Евро" },
  { code: "USD", name: "Доллар США" },
  { code: "RSD", name: "Сербский динар" },
  { code: "AMD", name: "Армянский драм" },
  { code: "GBP", name: "Фунт стерлингов" },
] as const;

export type Code = (typeof currencies)[number]["code"];

export interface Rates {
  /** Units of each currency per one US dollar. */
  perUsd: Record<Code, number>;
  /** When the provider published these rates. */
  updated: number;
  /** When we downloaded them. */
  fetched: number;
}

const STORAGE_KEY = "xccy-rates";
// The providers publish once a day, so we only refresh roughly once per day.
const REFRESH_AFTER = 24 * 60 * 60 * 1000;

function toRates(table: Record<string, unknown> | undefined, updated: unknown, fetched: unknown): Rates {
  if (typeof updated !== "number" || typeof fetched !== "number") throw new Error("Bad timestamp");
  const perUsd = {} as Record<Code, number>;
  for (const { code } of currencies) {
    const rate = table?.[code] ?? table?.[code.toLowerCase()];
    if (typeof rate !== "number" || !(rate > 0)) throw new Error(`No rate for ${code}`);
    perUsd[code] = rate;
  }
  return { perUsd, updated, fetched };
}

async function getJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

// Tried in order; the second one only matters when the first is down.
const sources: (() => Promise<Rates>)[] = [
  async () => {
    const data = await getJson("https://open.er-api.com/v6/latest/USD");
    return toRates(data.rates, data.time_last_update_unix * 1000, Date.now());
  },
  async () => {
    const data = await getJson(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    );
    return toRates(data.usd, Date.parse(data.date), Date.now());
  },
];

async function fetchRates(): Promise<Rates> {
  let lastError: unknown;
  for (const source of sources) {
    try {
      return await source();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

const listeners = new Set<() => void>();

// undefined until storage has been looked at.
let current: Rates | null | undefined;

function read(): Rates | null {
  if (current === undefined) {
    current = null;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      current = toRates(saved.perUsd, saved.updated, saved.fetched);
    } catch {
      // Nothing usable saved — wait for the network.
    }
  }
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function store(rates: Rates): void {
  current = rates;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
  } catch {
    // The rates just won't be available offline.
  }
  listeners.forEach((listener) => listener());
}

/** Last known rates (kept in localStorage so the page works offline), refreshed in the background. */
export function useRates(): { rates: Rates | null; failed: boolean } {
  const rates = useSyncExternalStore(subscribe, read, () => null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const saved = read();
    if (saved && Date.now() - saved.fetched < REFRESH_AFTER) return;
    let cancelled = false;
    fetchRates().then(store, () => {
      if (!cancelled) setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, failed };
}
