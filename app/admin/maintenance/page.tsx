"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { isSuperAdmin } from "@/data/spices";
import { loadAdminOrders, loadUserOrders, resetAllOrders } from "@/lib/orders";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MaintenancePage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [counts, setCounts] = useState({ admin: 0, user: 0 });
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (!isSuperAdmin(user.email) && user.role !== "SUPER_ADMIN") {
      router.replace("/admin");
      return;
    }
    setCounts({
      admin: loadAdminOrders().length,
      user: loadUserOrders().length,
    });
  }, [user, ready, router]);

  function handleReset() {
    if (confirm !== "RESET") {
      setMsg("Type RESET in the box to confirm.");
      return;
    }
    resetAllOrders();
    setCounts({ admin: 0, user: 0 });
    setConfirm("");
    setMsg("All orders cleared on this browser.");
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-makola-green text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <BrandLogo href="/admin" size="sm" />
        <ThemeToggle />
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
        <Link href="/admin" className="text-sm font-semibold text-makola-orange">
          ← Back to admin
        </Link>
        <h1 className="text-2xl font-bold text-red-700">Maintenance</h1>
        <p className="text-sm text-gray-600">
          Super Admin only. Reset clears order data stored in this browser (localStorage).
        </p>

        <div className="rounded-2xl border bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm">Admin orders list: <strong>{counts.admin}</strong></p>
          <p className="text-sm">Customer orders list: <strong>{counts.user}</strong></p>
        </div>

        {msg && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{msg}</div>
        )}

        <div className="space-y-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4 dark:bg-red-950/30">
          <p className="font-bold text-red-700">Reset all orders</p>
          <p className="text-xs text-red-600">
            Type <strong>RESET</strong> below, then confirm. This cannot be undone.
          </p>
          <input
            className="input-lg"
            placeholder="Type RESET"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button type="button" onClick={handleReset} className="w-full rounded-2xl bg-red-600 py-3 font-bold text-white">
            Clear all orders now
          </button>
        </div>
      </div>
    </div>
  );
}
