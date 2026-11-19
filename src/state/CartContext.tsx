import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Prototype bag: line items in localStorage so the header count survives a
 * refresh. Shopify's Ajax Cart API (/cart/add.js) replaces this later —
 * the shape (variant id + quantity + selling plan) is kept compatible.
 */
export interface CartLine {
  productId: string;
  packSize: number;
  subscribe: boolean;
  quantity: number;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  add: (line: CartLine) => void;
  /** Add several lines in one go (e.g. a bundle) — one confirmation. */
  addMany: (lines: CartLine[]) => void;
  setQuantity: (index: number, quantity: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  /** The most recent add (with a timestamp) so UI can play a confirmation. */
  lastAdded: { line: CartLine; at: number; extra?: number } | null;
}

const CartContext = createContext<CartValue | null>(null);
const KEY = "gr:cart";

function read(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(read);
  const [lastAdded, setLastAdded] = useState<CartValue["lastAdded"]>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      // storage unavailable — bag just isn't remembered
    }
  }, [lines]);

  const addMany = useCallback((incoming: CartLine[]) => {
    if (!incoming.length) return;
    setLines((current) => {
      const next = [...current];
      for (const line of incoming) {
        const i = next.findIndex(
          (l) => l.productId === line.productId && l.packSize === line.packSize && l.subscribe === line.subscribe
        );
        if (i === -1) next.push(line);
        else next[i] = { ...next[i], quantity: Math.min(9, next[i].quantity + line.quantity) };
      }
      return next;
    });
    setLastAdded({ line: incoming[0], at: Date.now(), extra: incoming.length - 1 });
  }, []);
  const add = useCallback((line: CartLine) => addMany([line]), [addMany]);

  const setQuantity = useCallback((index: number, quantity: number) => {
    setLines((current) =>
      quantity < 1
        ? current.filter((_, i) => i !== index)
        : current.map((l, i) => (i === index ? { ...l, quantity: Math.min(9, quantity) } : l))
    );
  }, []);
  const remove = useCallback((index: number) => setLines((c) => c.filter((_, i) => i !== index)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      add,
      addMany,
      setQuantity,
      remove,
      clear,
      lastAdded,
      count: lines.reduce((n, l) => n + l.quantity, 0),
    }),
    [lines, add, addMany, setQuantity, remove, clear, lastAdded]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
