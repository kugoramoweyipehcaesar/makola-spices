"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Spice } from "@/data/spices";

export type CartItem = { spice: Spice; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (spice: Spice, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("makola-cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("makola-cart", JSON.stringify(items));
  }, [items]);

  const api = useMemo<CartCtx>(
    () => ({
      items,
      add(spice, qty = 1) {
        setItems((prev) => {
          const i = prev.findIndex((x) => x.spice.id === spice.id);
          if (i >= 0) {
            const next = [...prev];
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return next;
          }
          return [...prev, { spice, qty }];
        });
      },
      setQty(id, qty) {
        setItems((prev) =>
          qty <= 0
            ? prev.filter((x) => x.spice.id !== id)
            : prev.map((x) => (x.spice.id === id ? { ...x, qty } : x))
        );
      },
      remove(id) {
        setItems((prev) => prev.filter((x) => x.spice.id !== id));
      },
      clear() {
        setItems([]);
      },
      totalItems: items.reduce((s, x) => s + x.qty, 0),
      subtotal: items.reduce((s, x) => s + x.spice.pricePerOlonka * x.qty, 0),
    }),
    [items]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
