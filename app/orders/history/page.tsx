"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { loadAdminOrders, loadUserOrders, type StoredOrder } from "@/lib/orders";
import { formatGhs } from "@/lib/utils";

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    const userOrders = loadUserOrders();
    const adminOrders = loadAdminOrders();
    const map = new Map<string, StoredOrder>();
    [...adminOrders, ...userOrders].forEach((o) => map.set(o.id, o));
    let list = Array.from(map.values());
    if (user?.phone || user?.name) {
      const phone = (user.phone || "").replace(/\D/g, "");
      const name = (user.name || "").toLowerCase();
      const filtered = list.filter(
        (o) =>
          (o.phone && o.phone.replace(/\D/g, "").endsWith(phone.slice(-9))) ||
          (o.customer && o.customer.toLowerCase() === name) ||
          !user
      );
      if (filtered.length) list = filtered;
    }
    list.sort((a, b) => (b.createdAt || b.id).localeCompare(a.createdAt || a.id));
    setOrders(list);
  }, [user]);

  return (
    <div className="min-h-[100dvh] w-full bg-makola-cream pb-28 dark:bg-zinc-950">
      <header className="flex items-center justify-between bg-makola-orange px-4 py-3 text-white">
        <BrandLogo href="/" light size="sm" />
        <ThemeToggle />
      </header>

      <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-6">
        <h1 className="text-2xl font-bold text-makola-green dark:text-green-400">Order history</h1>
        <p className="text-sm text-gray-500">Past and current orders on this device</p>

        <div className="flex gap-2">
          <Link href="/orders/track" className="btn-outline flex-1 text-center text-sm py-2">
            Track order
          </Link>
          <Link href="/checkout" className="btn-orange flex-1 text-center text-sm py-2">
            New order
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-500 dark:bg-zinc-900">
            No orders yet.{" "}
            <Link href="/shop" className="font-bold text-makola-orange">
              Shop spices
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/track?id=${encodeURIComponent(o.id)}`}
                className="block rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex justify-between gap-2">
                  <p className="font-bold">{o.id}</p>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                    {o.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{o.item}</p>
                <p className="mt-1 font-semibold text-makola-orange">{formatGhs(o.amount)}</p>
                <p className="text-xs text-gray-400">{o.stall}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
