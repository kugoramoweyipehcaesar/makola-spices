"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, BarChart3, Bike, ClipboardList, HelpCircle, LogOut, Settings,
  Package, Phone, Plus, Smartphone, Trash2, Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { isSuperAdmin, type Role, type Spice } from "@/data/spices";
import { loadProducts, addProduct, updateProduct, deleteProduct } from "@/lib/products";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { loadFeedback, type Feedback } from "@/lib/feedback";
import { updateOrderStatus, formatOrderDate, loadAdminOrders, saveAdminOrders, resetAllOrders } from "@/lib/orders";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn, formatGhs } from "@/lib/utils";

type Tab = "orders" | "spices" | "users" | "riders" | "payments" | "reports" | "help" | "maintenance";

const ORDER_STATUSES = ["Pending", "Processing", "On the way", "Delivered", "Cancelled"] as const;

type OrderRow = {
  id: string;
  customer: string;
  stall: string;
  item: string;
  amount: number;
  status: string;
  delivery: string;
  fee: number;
  productIds?: string[];
  pay?: string;
  momoTransactionId?: string;
  momoReference?: string;
  createdAt?: string;
  updatedAt?: string;
};

const DEMO_ORDERS: OrderRow[] = [
  { id: "1", customer: "Aunty Ama", stall: "Lane 3", item: "Ginger 2 olonka", amount: 100, status: "Pending", delivery: "ASAP", fee: 10, productIds: ["ginger"], createdAt: new Date().toISOString() },
  { id: "2", customer: "Mama Efua", stall: "Agbogbloshie", item: "Prekese 1 olonka", amount: 40, status: "Processing", delivery: "ASAP", fee: 10, productIds: ["prekese"], createdAt: new Date().toISOString() },
  { id: "3", customer: "Sister Akos", stall: "Lane 1", item: "Jollof Mix 3 olonka", amount: 180, status: "On the way", delivery: "ASAP", fee: 10, productIds: ["jollof-mix"], createdAt: new Date().toISOString() },
  { id: "4", customer: "Aunty Grace", stall: "Kaneshie", item: "Anise Seeds 2 olonka", amount: 70, status: "Delivered", delivery: "ASAP", fee: 25, productIds: ["anise"], createdAt: new Date().toISOString() },
];

export default function AdminPage() {
  const { user, users, logout, setRole, banUser, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<OrderRow[]>(DEMO_ORDERS);
  const [products, setProducts] = useState<Spice[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ momoName: "", momoNumber: "" });
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [toast, setToast] = useState("");
  const [newP, setNewP] = useState({
    name: "", nameTwi: "", pricePerOlonka: "", stock: "50",
    category: "local" as Spice["category"], unit: "olonka", emoji: "\ud83c\udf36\ufe0f", image: "",
  });

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/admin/login"); return; }
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.replace("/shop");
  }, [user, ready, router]);

  useEffect(() => {
    setProducts(loadProducts());
    setSettings(loadSettings());
    setFeedback(loadFeedback());
    const stored = loadAdminOrders();
    if (stored.length) {
      setOrders(stored.map((o) => ({
        id: o.id,
        customer: o.customer,
        stall: o.stall,
        item: o.item,
        amount: o.amount,
        status: o.status,
        delivery: o.delivery || "ASAP",
        fee: o.fee || 0,
        productIds: o.productIds,
        pay: o.pay,
        momoTransactionId: o.momoTransactionId,
        momoReference: o.momoReference,
        createdAt: o.createdAt || new Date().toISOString(),
        updatedAt: o.updatedAt,
      })));
    }
  }, []);

  useEffect(() => {
    saveAdminOrders(orders as any);
  }, [orders]);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  }

  if (!ready || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-makola-green text-white">
        Loading admin\u2026
      </div>
    );
  }

  const salesToday = orders.reduce((s, o) => s + (o.status !== "Cancelled" ? o.amount : 0), 0);
  const pending = orders.filter((o) => o.status === "Pending").length;
  const isOwner = isSuperAdmin(user.email);
  const riders = users.filter((u) => u.role === "RIDER" && !u.banned);

  const menu: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "spices", label: "Spices", icon: Package },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "riders", label: "Delivery Riders", icon: Bike },
    { id: "payments", label: "Payments (MoMo)", icon: Smartphone },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "help", label: "Help & Support", icon: HelpCircle },
    { id: "maintenance", label: "Maintenance", icon: Settings },
  ];

  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newP.name || !newP.pricePerOlonka) {
      showToast("Name and price required");
      return;
    }
    const list = addProduct({
      name: newP.name,
      nameTwi: newP.nameTwi || newP.name,
      nameGa: newP.name,
      category: newP.category,
      pricePerOlonka: Number(newP.pricePerOlonka),
      unit: newP.unit,
      emoji: newP.emoji || "\ud83c\udf36\ufe0f",
      description: newP.name,
      stock: Number(newP.stock) || 0,
    } as Spice);
    setProducts(list);
    setNewP({ name: "", nameTwi: "", pricePerOlonka: "", stock: "50", category: "local", unit: "olonka", emoji: "\ud83c\udf36\ufe0f", image: "" });
    showToast("Product added");
  }

  const productSales = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      const key = o.item.split(" ")[0] || o.item;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [orders]);
  const maxProductCount = Math.max(1, ...productSales.map((p) => p.count), 1);

  return (
    <div className="flex min-h-[100dvh] w-full overflow-x-hidden bg-gray-50 dark:bg-zinc-950">
      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-[90vw] rounded-xl bg-makola-green px-4 py-2 text-sm text-white shadow">{toast}</div>
      )}

      <aside className="hidden w-56 shrink-0 flex-col bg-makola-green text-white lg:flex">
        <div className="border-b border-white/10 px-3 py-4">
          <BrandLogo href="/" light size="sm" />
          <p className="mt-1 text-[10px] text-green-200">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {menu.map((m) => (
            <button key={m.id} type="button" onClick={() => setTab(m.id)}
              className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm", tab === m.id ? "bg-makola-orange font-semibold" : "text-green-100 hover:bg-white/10")}>
              <m.icon className="h-4 w-4 shrink-0" />{m.label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => { logout(); router.push("/admin/login"); }}
          className="m-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-green-200 hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:px-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-makola-green dark:text-green-400">MAKOLA COMPANY LIMITED</p>
            <p className="text-xs text-gray-500">
              {user.name} \u00b7 {user.role}
              {isOwner && <span className="ml-1 rounded bg-orange-100 px-1.5 text-[10px] font-bold text-orange-700">SUPER ADMIN</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Online</span>
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b bg-white px-2 py-2 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
          {menu.map((m) => (
            <button key={m.id} type="button" onClick={() => setTab(m.id)}
              className={cn("shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold", tab === m.id ? "bg-makola-orange text-white" : "bg-gray-100 text-gray-600 dark:bg-zinc-800")}>
              {m.label}
            </button>
          ))}
        </div>

        <main className="w-full flex-1 overflow-x-auto p-3 sm:p-6">
          {tab === "orders" && (
            <>
              <h1 className="text-xl font-bold sm:text-2xl">Today's Orders</h1>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold text-makola-green dark:text-green-400">{formatGhs(salesToday)}</p>
                </div>
                <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-makola-orange">{pending}</p>
                </div>
                <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="flex items-center gap-1 text-sm text-gray-500"><AlertTriangle className="h-4 w-4 text-amber-500" /> Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
              <div className="mt-6 overflow-x-auto rounded-2xl border bg-white dark:border-zinc-700 dark:bg-zinc-900">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-400">
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Placed</th>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Call</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-50 dark:border-zinc-800">
                        <td className="px-3 py-3">
                          <p className="font-semibold">{o.customer}</p>
                          <p className="text-xs text-gray-400">{o.stall}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">{formatOrderDate(o.createdAt)}</td>
                        <td className="px-3 py-3">{o.item}</td>
                        <td className="px-3 py-3 font-semibold">{formatGhs(o.amount)}</td>
                        <td className="px-3 py-3">
                          <select
                            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold dark:border-zinc-600 dark:bg-zinc-800"
                            value={o.status}
                            onChange={(e) => {
                              const nextStatus = e.target.value;
                              updateOrderStatus(o.id, nextStatus);
                              setOrders((list) =>
                                list.map((x) =>
                                  x.id === o.id
                                    ? { ...x, status: nextStatus, updatedAt: new Date().toISOString() }
                                    : x
                                )
                              );
                              showToast(`Order ${o.id} \u2192 ${nextStatus} (live site-wide)`);
                            }}
                          >
                            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <a href="tel:0548161539" className="inline-flex rounded-lg bg-gray-100 p-1.5 dark:bg-zinc-800"><Phone className="h-4 w-4" /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "spices" && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold sm:text-2xl">Spices</h1>
              <form onSubmit={handleAddProduct} className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="mb-3 flex items-center gap-2 font-bold"><Plus className="h-4 w-4" /> Add product</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="input-lg" placeholder="Name" value={newP.name} onChange={(e) => setNewP((p) => ({ ...p, name: e.target.value }))} />
                  <input className="input-lg" type="number" placeholder="Price GHS" value={newP.pricePerOlonka} onChange={(e) => setNewP((p) => ({ ...p, pricePerOlonka: e.target.value }))} />
                </div>
                <button type="submit" className="btn-orange mt-3">Add Product</button>
              </form>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((s) => (
                  <div key={s.id} className="rounded-2xl border bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="flex justify-between">
                      <span className="text-2xl">{s.emoji}</span>
                      <button type="button" className="text-red-600" onClick={() => { if (confirm(`Delete ${s.name}?`)) { setProducts(deleteProduct(s.id)); showToast("Deleted"); } }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-bold">{s.name}</p>
                    <input type="number" className="input-lg mt-2 py-2" value={s.pricePerOlonka}
                      onChange={(e) => setProducts(updateProduct(s.id, { pricePerOlonka: Number(e.target.value) }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "users" && (
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Users & Roles</h1>
              <div className="mt-4 space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                    <div>
                      <p className="font-bold">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.phone} \u00b7 {u.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select className="rounded-lg border px-2 py-1 text-xs" value={u.role} disabled={isSuperAdmin(u.email)}
                        onChange={(e) => { const r = e.target.value as Role; showToast(setRole(u.id, r).ok ? `Role \u2192 ${r}` : "Failed"); }}>
                        <option value="BUYER">Buyer</option>
                        <option value="RIDER">Rider</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      {!isSuperAdmin(u.email) && (
                        <button type="button" className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600"
                          onClick={() => showToast(banUser(u.id, !u.banned).ok ? (u.banned ? "Unbanned" : "Banned") : "Failed")}>
                          {u.banned ? "Unban" : "Ban"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "riders" && (
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Delivery Riders</h1>
              <div className="mt-4 space-y-2">
                {riders.length === 0 && <p className="text-gray-500">No riders yet.</p>}
                {riders.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="font-bold">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "payments" && (
            <div className="max-w-md space-y-4">
              <h1 className="text-xl font-bold sm:text-2xl">MoMo Payments</h1>
              <input className="input-lg" placeholder="MoMo name" value={settings.momoName} onChange={(e) => setSettings((s) => ({ ...s, momoName: e.target.value }))} />
              <input className="input-lg" placeholder="MoMo number" value={settings.momoNumber} onChange={(e) => setSettings((s) => ({ ...s, momoNumber: e.target.value }))} />
              <button type="button" className="btn-orange w-full" onClick={() => { saveSettings(settings); showToast("MoMo saved"); }}>Save</button>
            </div>
          )}

          {tab === "reports" && (
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Reports</h1>
              <div className="mt-4 space-y-2">
                {productSales.map((p) => (
                  <div key={p.name}>
                    <div className="flex justify-between text-sm"><span>{p.name}</span><span className="font-bold">{p.count}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-makola-orange" style={{ width: `${(p.count / maxProductCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "help" && (
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Help & Support</h1>
              <div className="mt-4 space-y-3">
                {feedback.length === 0 && <p className="text-gray-500">No feedback yet.</p>}
                {feedback.map((f) => (
                  <div key={f.id} className="rounded-xl border bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="text-xs uppercase text-gray-400">{f.type}</p>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-sm">{f.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "maintenance" && (
            <div className="max-w-lg space-y-4">
              <h1 className="text-xl font-bold text-red-700 sm:text-2xl">Maintenance</h1>
              <p className="text-sm text-gray-600">
                Permanently delete all orders across the whole website. Cannot be undone. Page auto-refreshes after reset.
              </p>
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 dark:bg-red-950/30">
                <p className="font-bold text-red-700">Reset all orders</p>
                <p className="mt-1 text-xs text-red-600">
                  Clears admin queue, customer history, track & rider views immediately.
                </p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-red-600 py-3.5 font-bold text-white"
                  onClick={() => {
                    if (!confirm("PERMANENTLY reset ALL orders on the whole website?")) return;
                    if (!confirm("This cannot be undone. Continue?")) return;
                    resetAllOrders();
                    setOrders([]);
                    showToast("All orders cleared \u2014 refreshing\u2026");
                    setTimeout(() => window.location.reload(), 600);
                  }}
                >
                  Reset all orders permanently
                </button>
              </div>
              <Link href="/admin/maintenance" className="text-sm font-semibold text-makola-orange underline">
                Open full maintenance page \u2192
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
