import { useSyncExternalStore } from "react";
import { Code, currencies } from "./rates";

const STORAGE_KEY = "xccy-order";

export const defaultOrder: Code[] = currencies.map(({ code }) => code);
const listeners = new Set<() => void>();

// undefined until storage has been looked at.
let current: Code[] | undefined;

function read(): Code[] {
  if (current === undefined) {
    current = defaultOrder;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      // Only accept a reordering of exactly the currencies we show, so the list
      // survives currencies being added or removed later.
      if (
        Array.isArray(saved) &&
        saved.length === defaultOrder.length &&
        defaultOrder.every((code) => saved.includes(code))
      )
        current = saved;
    } catch {
      // Nothing usable saved — keep the default order.
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

export function setOrder(order: Code[]): void {
  current = order;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // The order just won't be remembered.
  }
  listeners.forEach((listener) => listener());
}

/**
 * The user's preferred order of the currency rows, or null while it isn't known yet
 * (in the prerendered HTML, before the browser has had a chance to look in storage).
 */
export function useOrder(): Code[] | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
