"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loadAdminOrders, saveAdminOrders, type StoredOrder } from "@/lib/orders";
import { formatGhs } from "@/lib/utils";

const STATUSES = ["Pending", "Processing", "On the way", "Delivered", "Cancelled"] as const;

const SEED: StoredOrder[] = [
  { id: "1", customer: "Aunty Ama", stall: "Lane 3", item: "Ginger 2 olonka", amount: 100, status: "Pending", delivery: "ASAP" },
  { id: "2", customer: "Mama Efua", stall: "Agbogbloshie", item: "Prekese 1 olonka", amount: 40, status: "Pending", delivery: "ASAP" },
  { id: "3", customer: "Sister Akos", stall: "Lane 1", item: "Jollof Mix 3 olonka", amount: 180, status: "Pending", delivery: "ASAP" },
  { id: "4", customer: "Aunty Grace", stall: "Kaneshie", item: "Anise 2 olonka", amount: 70, status: "Processing", delivery: "ASAP" },
];

export default function RiderPage() {
  const { user, logout, ready } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login?next=/rider");
      return;
    }
    if (user.role !== "RIDER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/shop");
      return;
    }
    const stored = loadAdminOrders();
    setOrders(stored.length ? stored : SEED);
  }, [user, ready, router]);

  function setStatus(id: string, status: string) {
    setOrders((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, status } : x));
      saveAdminOrders(next);
      return next;
    });
    setToast(`Order ${id} → ${status}`);
    setTimeout(() => setToast(""), 2000);
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">Loading rider…</div>
    );
  }

  const active = orders.filter(
    (o) => o.status === "Pending" || o.status === "Processing" || o.status === "On the way"
  );

  return (
    <div className="min-h-[100dvh] bg-makola-cream px-4 py-4 dark:bg-zinc-950">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-xl bg-makola-green px-4 py-2 text-sm text-white shadow">
          {toast}
        </div>
      )}
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between gap-2">
          <BrandLogo href="/rider" size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-sm font-semibold text-makola-orange"
            >
              Logout
            </button>
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-makola-green dark:text-green-400">
          Rider — Pending queue
        </h1>
        <p className="text-sm text-gray-500">
          {user.name} · RIDER view only (no admin / shop)
        </p>

        <div className="mt-4 space-y-3">
          {active.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-gray-500 dark:bg-zinc-900">
              No pending deliveries right now.
            </p>
          )}
          {active.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">{o.customer}</p>
                  <p className="text-sm text-gray-500">
                    {o.stall} · {o.delivery || "ASAP"}
                  </p>
                  <p className="mt-1 text-sm">{o.item}</p>
                  <p className="font-semibold text-makola-orange">{formatGhs(o.amount)}</p>
                </div>
                <span className="h-fit rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  {o.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== "Pending").map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(o.id, s)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold ${
                      o.status === s ? "bg-makola-orange text-white" : "bg-gray-100 text-gray-700 dark:bg-zinc-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
