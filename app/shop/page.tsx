"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { type Spice } from "@/data/spices";
import { loadProducts } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { cn, formatGhs } from "@/lib/utils";

type Filter = "all" | "local" | "mixed" | "bulk";

export default function ShopPage() {
  const { add, setQty, items, totalItems } = useCart();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");
  const [spices, setSpices] = useState<Spice[]>([]);

  useEffect(() => {
    setSpices(loadProducts());
  }, []);

  const qtyOf = (id: string) => items.find((x) => x.spice.id === id)?.qty || 0;

  const list = useMemo(() => {
    return spices.filter((s) => {
      if (filter !== "all" && s.category !== filter) return false;
      if (!q) return true;
      const t = q.toLowerCase();
      return (
        s.name.toLowerCase().includes(t) ||
        s.nameTwi.toLowerCase().includes(t) ||
        s.nameGa.toLowerCase().includes(t)
      );
    });
  }, [filter, q, spices]);

  function bump(spice: Spice, delta: number) {
    const cur = qtyOf(spice.id);
    if (cur === 0 && delta > 0) {
      add(spice, 1);
      setToast(`${spice.name} added`);
      setTimeout(() => setToast(""), 1500);
      return;
    }
    setQty(spice.id, cur + delta);
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-makola-sand pb-28">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-makola-green px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <header className="w-full bg-makola-orange px-3 pb-3 pt-3 text-white sm:px-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2">
          <BrandLogo href="/" light size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/checkout" className="relative shrink-0 p-1">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-makola-orange">
                {totalItems}
              </span>
            )}
          </Link>
          </div>
        </div>

        <div className="mx-auto mt-3 max-w-6xl">
          <div className="flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm">
            <span>📍</span>
            <span className="flex-1 truncate">Delivering to: Makola Market, Accra</span>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none"
              placeholder="Search for spices…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-3 pt-4 sm:px-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {([
            ["all", "All"],
            ["local", "Local"],
            ["mixed", "Mixed"],
            ["bulk", "Bulk"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-sm font-bold",
                filter === id ? "bg-makola-orange text-white" : "bg-white text-gray-600 shadow-sm"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <h2 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">Shop Spices</h2>
        <p className="text-sm text-gray-500">Prices are per olonka · Simple &amp; fresh</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {list.map((s) => {
            const qty = qtyOf(s.id);
            return (
              <div key={s.id} className="card-spice flex flex-col">
                <div className="flex h-20 items-center justify-center text-4xl sm:h-24 sm:text-5xl">
                  {s.emoji}
                </div>
                <h3 className="mt-1 text-center text-sm font-bold text-gray-900 sm:text-base">
                  {s.name}
                </h3>
                <p className="text-center text-xs text-gray-500">({s.nameTwi})</p>
                <p className="mt-1 text-center text-base font-bold text-makola-orange sm:text-lg">
                  {formatGhs(s.pricePerOlonka)}
                </p>
                <p className="text-center text-[11px] text-gray-400">per {s.unit}</p>
                {s.stock <= 10 && (
                  <p className="text-center text-[11px] font-semibold text-red-500">Low stock</p>
                )}
                <div className="mt-auto flex flex-wrap items-center justify-center gap-1 pt-2">
                  <button
                    type="button"
                    onClick={() => bump(s, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-makola-orange text-makola-orange font-bold"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{qty || 1}</span>
                  <button
                    type="button"
                    onClick={() => bump(s, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-makola-orange text-white font-bold"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      add(s, qty || 1);
                      setToast(`${s.name} in basket`);
                      setTimeout(() => setToast(""), 1500);
                    }}
                    className="ml-0.5 rounded-xl bg-makola-orange px-2 py-1.5 text-[11px] font-bold text-white sm:text-xs"
                  >
                    Add to Basket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
