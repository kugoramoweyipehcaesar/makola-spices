"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, BarChart3, Bike, ClipboardList, HelpCircle, LogOut,
  Package, Phone, Plus, Smartphone, Trash2, Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { isSuperAdmin, type Role, type Spice } from "@/data/spices";
import { loadProducts, addProduct, updateProduct, deleteProduct } from "@/lib/products";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { loadFeedback, type Feedback } from "@/lib/feedback";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn, formatGhs } from "@/lib/utils";

type Tab = "orders" | "spices" | "users" | "riders" | "payments" | "reports" | "help";

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
};

const DEMO_ORDERS: OrderRow[] = [
  { id: "1", customer: "Aunty Ama", stall: "Lane 3", item: "Ginger 2 olonka", amount: 100, status: "Pending", delivery: "ASAP", fee: 10, productIds: ["ginger"] },
  { id: "2", customer: "Mama Efua", stall: "Agbogbloshie", item: "Prekese 1 olonka", amount: 40, status: "Processing", delivery: "ASAP", fee: 10, productIds: ["prekese"] },
  { id: "3", customer: "Sister Akos", stall: "Lane 1", item: "Jollof Mix 3 olonka", amount: 180, status: "On the way", delivery: "ASAP", fee: 10, productIds: ["jollof-mix"] },
  { id: "4", customer: "Aunty Grace", stall: "Kaneshie", item: "Anise Seeds 2 olonka", amount: 70, status: "Delivered", delivery: "ASAP", fee: 25, productIds: ["anise"] },
  { id: "5", customer: "Aunty Ama", stall: "Lane 3", item: "Ginger 1 olonka", amount: 50, status: "Delivered", delivery: "ASAP", fee: 10, productIds: ["ginger"] },
  { id: "6", customer: "Kofi M.", stall: "Circle", item: "Garlic 2 olonka", amount: 110, status: "Delivered", delivery: "ASAP", fee: 25, productIds: ["garlic"] },
];

export default function AdminPage() {
  const { user, users, logout, setRole, banUser, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [products, setProducts] = useState<Spice[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ momoName: "", momoNumber: "" });
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [toast, setToast] = useState("");
  const [newP, setNewP] = useState({
    name: "", nameTwi: "", pricePerOlonka: "", stock: "50",
    category: "local" as Spice["category"], unit: "olonka", emoji: "🌶️", image: "",
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
    try {
      const saved = localStorage.getItem("makola-admin-orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) setOrders(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("makola-admin-orders", JSON.stringify(orders));
  }, [orders]);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  }

  const productSales = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      const key = o.item.split(" ")[0] || o.item;
      map[key] = (map[key] || 0) + 1;
      (o.productIds || []).forEach((id) => {
        map[id] = (map[id] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [orders]);

  const maxProductCount = Math.max(1, ...productSales.map((p) => p.count));
  const weeklySales = useMemo(() => {
    // Demo weekly bars from order amounts
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = orders.reduce((s, o) => s + (o.status !== "Cancelled" ? o.amount : 0), 0);
    return days.map((d, i) => ({
      label: d,
      value: Math.round(base * (0.08 + (i % 5) * 0.04) + (i * 12)),
    }));
  }, [orders]);
  const maxWeek = Math.max(1, ...weeklySales.map((d) => d.value));
  const monthlySales = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const base = orders.reduce((s, o) => s + (o.status !== "Cancelled" ? o.amount : 0), 0);
    return months.map((m, i) => ({
      label: m,
      value: Math.round(base * (0.6 + i * 0.25) + i * 80),
    }));
  }, [orders]);
  const maxMonth = Math.max(1, ...monthlySales.map((d) => d.value));

  if (!ready || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-makola-green text-white">
        Loading admin…
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
      emoji: newP.emoji || "🌶️",
      description: newP.name,
      stock: Number(newP.stock) || 0,
      ...(newP.image ? { image: newP.image } as Partial<Spice> : {}),
    } as Spice);
    // store image on product via update if schema supports - extend in products
    if (newP.image) {
      const withImg = updateProduct(list[0].id, { ...(list[0] as Spice & { image?: string }), image: newP.image } as Partial<Spice>);
      setProducts(withImg);
    } else {
      setProducts(list);
    }
    setNewP({ name: "", nameTwi: "", pricePerOlonka: "", stock: "50", category: "local", unit: "olonka", emoji: "🌶️", image: "" });
    showToast("Product added");
  }

  function onImageFile(file: File | null, target: "new" | string) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      if (target === "new") {
        setNewP((p) => ({ ...p, image: data }));
      } else {
        setProducts(updateProduct(target, { image: data } as Partial<Spice>));
        showToast("Image updated");
      }
    };
    reader.readAsDataURL(file);
  }

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
              {user.name} · {user.role}
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
              <h1 className="text-xl font-bold sm:text-2xl">Today&apos;s Orders</h1>
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
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-400">
                      <th className="px-3 py-2">Customer</th>
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
                          {o.momoTransactionId && (
                            <p className="mt-1 text-[10px] text-makola-orange">
                              MoMo ID: {o.momoTransactionId}
                              {o.momoReference ? ` · Ref: ${o.momoReference}` : ""}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3">{o.item}</td>
                        <td className="px-3 py-3 font-semibold">{formatGhs(o.amount)}</td>
                        <td className="px-3 py-3">
                          <select
                            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold dark:border-zinc-600 dark:bg-zinc-800"
                            value={o.status}
                            onChange={(e) => {
                              setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: e.target.value } : x)));
                              showToast(`Order → ${e.target.value}`);
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
              <h1 className="text-xl font-bold sm:text-2xl">Spices — Add / Edit / Delete / Price / Image</h1>
              <form onSubmit={handleAddProduct} className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="mb-3 flex items-center gap-2 font-bold"><Plus className="h-4 w-4" /> Add new product</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input className="input-lg" placeholder="Name" value={newP.name} onChange={(e) => setNewP((p) => ({ ...p, name: e.target.value }))} />
                  <input className="input-lg" placeholder="Twi name" value={newP.nameTwi} onChange={(e) => setNewP((p) => ({ ...p, nameTwi: e.target.value }))} />
                  <input className="input-lg" type="number" placeholder="Price (GHS)" value={newP.pricePerOlonka} onChange={(e) => setNewP((p) => ({ ...p, pricePerOlonka: e.target.value }))} />
                  <input className="input-lg" type="number" placeholder="Stock" value={newP.stock} onChange={(e) => setNewP((p) => ({ ...p, stock: e.target.value }))} />
                  <select className="input-lg" value={newP.category} onChange={(e) => setNewP((p) => ({ ...p, category: e.target.value as Spice["category"] }))}>
                    <option value="local">Local</option>
                    <option value="mixed">Mixed</option>
                    <option value="bulk">Bulk</option>
                  </select>
                  <input className="input-lg" placeholder="Emoji" value={newP.emoji} onChange={(e) => setNewP((p) => ({ ...p, emoji: e.target.value }))} />
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-bold">Product image</label>
                    <input type="file" accept="image/*" className="text-sm" onChange={(e) => onImageFile(e.target.files?.[0] || null, "new")} />
                    {newP.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={newP.image} alt="preview" className="mt-2 h-20 w-20 rounded-xl object-cover" />
                    )}
                  </div>
                </div>
                <button type="submit" className="btn-orange mt-3">Add Product</button>
              </form>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((s) => {
                  const img = (s as Spice & { image?: string }).image;
                  return (
                    <div key={s.id} className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="flex items-start justify-between gap-2">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt={s.name} className="h-16 w-16 rounded-xl object-cover" />
                        ) : (
                          <span className="text-3xl">{s.emoji}</span>
                        )}
                        <button type="button" className="rounded-lg bg-red-50 p-1.5 text-red-600" onClick={() => {
                          if (confirm(`Delete ${s.name}?`)) { setProducts(deleteProduct(s.id)); showToast("Deleted"); }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 font-bold">{s.name}</p>
                      <p className="text-xs text-gray-400">({s.nameTwi})</p>
                      <label className="mt-2 block text-xs text-gray-500">Price (GHS)</label>
                      <input type="number" className="input-lg py-2" value={s.pricePerOlonka}
                        onChange={(e) => setProducts(updateProduct(s.id, { pricePerOlonka: Number(e.target.value) }))} />
                      <label className="mt-2 block text-xs text-gray-500">Stock</label>
                      <input type="number" className="input-lg py-2" value={s.stock}
                        onChange={(e) => setProducts(updateProduct(s.id, { stock: Number(e.target.value) }))} />
                      <label className="mt-2 block text-xs text-gray-500">Change image</label>
                      <input type="file" accept="image/*" className="text-xs" onChange={(e) => onImageFile(e.target.files?.[0] || null, s.id)} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "users" && (
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Users &amp; Roles</h1>
              <div className="mt-4 overflow-x-auto rounded-2xl border bg-white dark:border-zinc-700 dark:bg-zinc-900">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-400">
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const protectedUser = isSuperAdmin(u.email);
                      return (
                        <tr key={u.id} className="border-b border-gray-50 dark:border-zinc-800">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email || u.phone}</p>
                          </td>
                          <td className="px-4 py-3"><span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">{u.role}</span></td>
                          <td className="px-4 py-3">{u.banned ? <span className="text-xs text-red-600">Banned</span> : <span className="text-xs text-green-600">Active</span>}</td>
                          <td className="px-4 py-3">
                            {protectedUser ? (
                              <span className="text-xs text-gray-400">Protected</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {(["BUYER", "RIDER", "ADMIN"] as Role[]).map((r) => (
                                  <button key={r} type="button" className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold dark:bg-zinc-800"
                                    onClick={() => showToast(setRole(u.id, r).ok ? `Role → ${r}` : "Failed")}>{r}</button>
                                ))}
                                <button type="button" className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600"
                                  onClick={() => showToast(banUser(u.id, !u.banned).ok ? (u.banned ? "Unbanned" : "Banned") : "Failed")}>
                                  {u.banned ? "Unban" : "Ban"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "riders" && (
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Active Riders (admin only)</h1>
              {riders.length === 0 ? (
                <p className="mt-4 rounded-2xl border bg-white p-6 text-gray-500 dark:bg-zinc-900">No riders yet. Promote a user to RIDER.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {riders.map((r) => (
                    <div key={r.id} className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{r.name}</p>
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online
                        </span>
                      </div>
                      <p className="mt-2 text-sm">📞 {r.phone}</p>
                      {r.email && <p className="text-sm">✉️ {r.email}</p>}
                      <a href={`tel:${r.phone}`} className="btn-outline mt-3 w-full py-2 text-center text-sm">Call rider</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "payments" && (
            <div className="max-w-lg space-y-4">
              <h1 className="text-xl font-bold sm:text-2xl">MoMo payment details</h1>
              <div className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div>
                  <label className="mb-1 block text-sm font-bold">MoMo Account Name</label>
                  <input className="input-lg" value={settings.momoName} onChange={(e) => setSettings((s) => ({ ...s, momoName: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold">MoMo Number</label>
                  <input className="input-lg" value={settings.momoNumber} onChange={(e) => setSettings((s) => ({ ...s, momoNumber: e.target.value }))} />
                </div>
                <button type="button" className="btn-orange w-full" onClick={() => { saveSettings(settings); showToast("MoMo details saved"); }}>
                  Save MoMo details
                </button>
              </div>
            </div>
          )}

          {tab === "reports" && (
            <div className="space-y-8">
              <h1 className="text-xl font-bold sm:text-2xl">Sales analysis</h1>

              <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="font-bold text-makola-green dark:text-green-400">Weekly sales (GHS)</h2>
                <div className="mt-4 flex h-48 items-end gap-2 sm:gap-3">
                  {weeklySales.map((d) => (
                    <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-gray-500">{d.value}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-makola-orange to-amber-300"
                        style={{ height: `${(d.value / maxWeek) * 100}%`, minHeight: 8 }}
                      />
                      <span className="text-xs font-medium">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="font-bold text-makola-green dark:text-green-400">Monthly sales (GHS)</h2>
                <div className="mt-4 flex h-48 items-end gap-2 sm:gap-4">
                  {monthlySales.map((d) => (
                    <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-gray-500">{d.value}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-makola-green to-emerald-300"
                        style={{ height: `${(d.value / maxMonth) * 100}%`, minHeight: 8 }}
                      />
                      <span className="text-xs font-medium">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="font-bold text-makola-green dark:text-green-400">Top products bought</h2>
                <div className="mt-4 space-y-3">
                  {productSales.map((p, i) => (
                    <div key={p.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-gray-500">{p.count} orders</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            i === 0 && "bg-makola-orange",
                            i === 1 && "bg-amber-400",
                            i === 2 && "bg-makola-green-light",
                            i > 2 && "bg-blue-400"
                          )}
                          style={{ width: `${(p.count / maxProductCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {productSales.length === 0 && <p className="text-gray-500">No order data yet.</p>}
                </div>
              </div>
            </div>
          )}

          {tab === "help" && (
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Help &amp; Support</h1>
              <p className="text-sm text-gray-500">Customer suggestions and complaints from the website.</p>
              <div className="mt-4 space-y-3">
                {feedback.length === 0 && (
                  <p className="rounded-2xl border bg-white p-6 text-gray-500 dark:bg-zinc-900">
                    No feedback yet. Customers send messages from their Account page.
                  </p>
                )}
                {feedback.map((f) => (
                  <div key={f.id} className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{f.name}</p>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        f.type === "complaint" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {f.type}
                      </span>
                    </div>
                    {f.phone && <p className="text-xs text-gray-400">📞 {f.phone}</p>}
                    <p className="mt-2 text-sm">{f.message}</p>
                    <p className="mt-1 text-[10px] text-gray-400">{new Date(f.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-outline mt-4" onClick={() => setFeedback(loadFeedback())}>
                Refresh feedback
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
