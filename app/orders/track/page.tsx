"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { findOrderById, type StoredOrder } from "@/lib/orders";
import { formatGhs } from "@/lib/utils";

const FLOW = ["Pending", "Processing", "On the way", "Delivered"];

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const [id, setId] = useState("");
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = searchParams.get("id");
    if (q) {
      setId(q);
      const found = findOrderById(q);
      if (found) setOrder(found);
    }
  }, [searchParams]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const found = findOrderById(id);
    if (!found) {
      setOrder(null);
      setError("No order found. Check the order ID from your confirmation.");
      return;
    }
    setOrder(found);
  }

  const stepIndex = order
    ? Math.max(0, FLOW.findIndex((s) => s.toLowerCase() === (order.status || "").toLowerCase()))
    : -1;

  return (
    <div className="min-h-[100dvh] w-full bg-makola-cream pb-28 dark:bg-zinc-950">
      <header className="flex items-center justify-between bg-makola-orange px-4 py-3 text-white">
        <BrandLogo href="/" light size="sm" />
        <ThemeToggle />
      </header>

      <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-6">
        <h1 className="text-2xl font-bold text-makola-green dark:text-green-400">Track order</h1>
        <p className="text-sm text-gray-500">Enter your order ID (e.g. ORD-XXXX)</p>

        <form onSubmit={search} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <input
            className="input-lg"
            placeholder="Order ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <button type="submit" className="btn-orange w-full">
            Track
          </button>
        </form>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {order && (
          <div className="space-y-4 rounded-2xl border border-orange-100 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-bold">{order.id}</p>
                <p className="text-sm text-gray-500">
                  {order.customer} · {order.stall}
                </p>
              </div>
              <span className="h-fit rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                {order.status}
              </span>
            </div>
            <p className="text-sm">{order.item}</p>
            <p className="font-bold text-makola-orange">{formatGhs(order.amount)}</p>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-gray-400">Progress</p>
              {FLOW.map((s, i) => {
                const done = stepIndex >= i;
                const current = stepIndex === i;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        done ? "bg-makola-green text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`text-sm ${current ? "font-bold text-makola-orange" : ""}`}>{s}</span>
                  </div>
                );
              })}
              {order.status === "Cancelled" && (
                <p className="text-sm font-bold text-red-600">Order cancelled</p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/orders/history" className="btn-outline flex-1 text-center">
            Order history
          </Link>
          <Link href="/checkout" className="btn-outline flex-1 text-center">
            Cart / new order
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center">Loading…</div>}>
      <TrackOrderInner />
    </Suspense>
  );
}
