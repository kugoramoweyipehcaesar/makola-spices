"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { type Spice } from "@/data/spices";
import { loadProducts } from "@/lib/products";
import { onLiveUpdate } from "@/lib/live";
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
    const refresh = () => setSpices(loadProducts());
    refresh();
    return onLiveUpdate((scope) => {
      if (scope === "products" || scope === "all") refresh();
    });
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

  function handleAdd(s: Spice) {
    add(s, 1);
    setToast(`${s.name} added to basket`);
    setTimeout(() => setToast(""), 1800);
  }

  return (
    <div className="min-h-[100dvh] w-full bg-makola-cream pb-28 dark:bg-zinc-950">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-makola-green px-4 py-2 text-sm text-white shadow">
          {toast}
        </div>
      )}
      <header className="flex items-center justify-between gap-2 bg-makola-orange px-4 py-3 text-white">
        <BrandLogo href="/" light size="sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/checkout" className="relative rounded-xl bg-white/20 p-2">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-makola-green text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <h1 className="text-2xl font-extrabold text-makola-green dark:text-green-400">Shop Spices</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            className="input-lg pl-10"
            placeholder="Search spices…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "local", "mixed", "bulk"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-bold capitalize",
                filter === f ? "bg-makola-orange text-white" : "bg-white text-gray-600 dark:bg-zinc-800"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((s) => {
            const qty = qtyOf(s.id);
            return (
              <div
                key={s.id}
                className="flex flex-col rounded-2xl border border-orange-100 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex h-20 items-center justify-center text-4xl">
                  {(s as Spice & { image?: string }).image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(s as Spice & { image?: string }).image}
                      alt={s.name}
                      className="h-20 w-full rounded-xl object-cover"
                    />
                  ) : (
                    s.emoji
                  )}
                </div>
                <p className="mt-2 font-bold text-makola-green dark:text-green-400">{s.name}</p>
                <p className="text-xs text-gray-400">({s.nameTwi})</p>
                <p className="mt-1 font-bold text-makola-orange">{formatGhs(s.pricePerOlonka)}</p>
                {qty > 0 ? (
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <button type="button" className="rounded-lg bg-gray-100 px-3 py-1 font-bold dark:bg-zinc-800" onClick={() => setQty(s.id, qty - 1)}>
                      \u2212
                    </button>
                    <span className="font-bold">{qty}</span>
                    <button type="button" className="rounded-lg bg-gray-100 px-3 py-1 font-bold dark:bg-zinc-800" onClick={() => setQty(s.id, qty + 1)}>
                      +
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn-orange mt-2 py-2 text-sm" onClick={() => handleAdd(s)}>
                    Add to Basket
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <p className="py-12 text-center text-gray-500">No spices match your search.</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
