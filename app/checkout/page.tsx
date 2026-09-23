"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { WHATSAPP_NUMBER } from "@/data/spices";
import { loadSettings } from "@/lib/settings";
import { onLiveUpdate, notifyLive } from "@/lib/live";
import { cn, formatGhs, waLink } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, setQty, clear, totalItems } = useCart();
  const { user } = useAuth();
  const [pay, setPay] = useState<"momo" | "cash">("momo");
  const [inside, setInside] = useState(true);
  const [stallNote, setStallNote] = useState(user?.stall || "");
  const [momoTxnId, setMomoTxnId] = useState("");
  const [momoRef, setMomoRef] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [momo, setMomo] = useState({
    momoName: "MAKOLA COMPANY LIMITED",
    momoNumber: "0548161539",
  });

  useEffect(() => {
    const refresh = () => setMomo(loadSettings());
    refresh();
    return onLiveUpdate((scope) => {
      if (scope === "settings" || scope === "all") refresh();
    });
  }, []);

  const fee = inside ? 10 : 25;
  const total = subtotal + (items.length ? fee : 0);

  function placeOrder() {
    setError("");
    if (!items.length) return;

    if (pay === "momo") {
      if (!momoTxnId.trim()) {
        setError("Enter the Mobile Money Payment ID / Transaction ID.");
        return;
      }
      if (!momoRef.trim()) {
        setError("Enter the payment reference you used when sending money.");
        return;
      }
    }

    const order = {
      id: "ORD-" + Date.now().toString(36).toUpperCase(),
      items,
      subtotal,
      fee,
      total,
      pay,
      stall: stallNote || user?.stall || "Makola",
      customer: user?.name || "Customer",
      phone: user?.phone || "",
      status: "Pending",
      createdAt: new Date().toISOString(),
      momoTransactionId: pay === "momo" ? momoTxnId.trim() : undefined,
      momoReference: pay === "momo" ? momoRef.trim() : undefined,
    };

    try {
      const prev = JSON.parse(localStorage.getItem("makola-orders") || "[]");
      localStorage.setItem("makola-orders", JSON.stringify([order, ...prev]));

      const adminPrev = JSON.parse(localStorage.getItem("makola-admin-orders") || "[]");
      const row = {
        id: order.id,
        customer: order.customer,
        stall: order.stall,
        item: items.map((i) => `${i.spice.name} ${i.qty}`).join(", "),
        amount: total,
        status: "Pending",
        delivery: "ASAP",
        fee,
        productIds: items.map((i) => i.spice.id),
        pay,
        momoTransactionId: order.momoTransactionId,
        momoReference: order.momoReference,
        createdAt: order.createdAt,
      };
      localStorage.setItem("makola-admin-orders", JSON.stringify([row, ...adminPrev]));
      notifyLive("orders");
    } catch {
      /* ignore storage errors */
    }

    clear();
    setDone(true);
  }

  const orderText = items.map((i) => `${i.spice.name} x${i.qty}`).join(", ");

  if (done) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-makola-cream px-4 pb-24 dark:bg-zinc-950">
        <div className="text-6xl">\u2705</div>
        <h1 className="mt-4 text-2xl font-bold text-makola-green dark:text-green-400">
          Order received!
        </h1>
        <p className="mt-2 max-w-md text-center text-gray-600 dark:text-zinc-400">
          We will deliver to your stall. You can also confirm on WhatsApp.
        </p>
        {momoTxnId && (
          <p className="mt-2 text-sm text-gray-500">
            MoMo ID: <strong>{momoTxnId}</strong> \u00b7 Ref: <strong>{momoRef}</strong>
          </p>
        )}
        <div className="mt-3 flex w-full max-w-sm flex-col gap-2">
          <Link href="/orders/track" className="btn-outline text-center">Track order</Link>
          <Link href="/orders/history" className="btn-outline text-center">Order history</Link>
          <a
            href={waLink(
              WHATSAPP_NUMBER,
              `Order confirmed. Stall: ${stallNote}. ${orderText}. MoMo ID: ${momoTxnId || "N/A"} Ref: ${momoRef || "N/A"}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-green text-center"
          >
            \ud83d\udcac Confirm on WhatsApp
          </a>
          <Link href="/shop" className="btn-outline text-center">Back to Shop</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-makola-cream pb-28 dark:bg-zinc-950">
      <header className="w-full bg-makola-orange px-4 py-4 text-white">
        <div className="flex w-full items-center justify-between gap-2">
          <Link href="/shop" className="text-sm font-bold sm:text-base">\u2190 Cart</Link>
          <BrandLogo href="/" light size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-sm">{totalItems} items</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 lg:max-w-5xl">
        {!items.length ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-zinc-900">
            <p className="text-lg text-gray-500">Basket is empty</p>
            <Link href="/shop" className="btn-orange mt-4 inline-flex">Shop Spices</Link>
          </div>
        ) : (
          <>
            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <h2 className="text-lg font-bold text-makola-green dark:text-green-400">Your spices</h2>
              {items.map((i) => (
                <div key={i.spice.id} className="flex items-center justify-between border-b border-orange-50 py-2 last:border-0 dark:border-zinc-800">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.spice.emoji} {i.spice.name}</p>
                    <p className="text-sm text-gray-500">{formatGhs(i.spice.pricePerOlonka)} \u00d7 {i.qty}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" className="h-8 w-8 rounded-full border-2 border-makola-orange font-bold text-makola-orange" onClick={() => setQty(i.spice.id, i.qty - 1)}>\u2212</button>
                    <span className="w-6 text-center font-bold">{i.qty}</span>
                    <button type="button" className="h-8 w-8 rounded-full bg-makola-orange font-bold text-white" onClick={() => setQty(i.spice.id, i.qty + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <h2 className="mb-2 text-lg font-bold text-makola-green dark:text-green-400">Stall / Lane</h2>
              <input className="input-lg" placeholder="e.g. Lane 3, near Agbogbloshie" value={stallNote} onChange={(e) => setStallNote(e.target.value)} />
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <h2 className="mb-2 text-lg font-bold text-makola-green dark:text-green-400">Delivery area</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setInside(true)} className={cn("rounded-xl border-2 py-3 text-sm font-bold sm:text-base", inside ? "border-makola-green bg-green-50 text-makola-green dark:bg-green-950" : "border-gray-200 dark:border-zinc-700")}>Inside Makola (GHS 10)</button>
                <button type="button" onClick={() => setInside(false)} className={cn("rounded-xl border-2 py-3 text-sm font-bold sm:text-base", !inside ? "border-makola-green bg-green-50 text-makola-green dark:bg-green-950" : "border-gray-200 dark:border-zinc-700")}>Outside (GHS 25)</button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <h2 className="mb-3 text-lg font-bold text-makola-green dark:text-green-400">Payment method</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setPay("momo")} className={cn("flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-base font-bold", pay === "momo" ? "border-makola-orange bg-makola-orange text-white" : "border-orange-200 dark:border-zinc-700")}>📱 Mobile Money</button>
                <button type="button" onClick={() => setPay("cash")} className={cn("flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-base font-bold", pay === "cash" ? "border-makola-orange bg-makola-orange text-white" : "border-orange-200 dark:border-zinc-700")}>💵 Cash on delivery</button>
              </div>
            </div>

            {pay === "momo" && (
              <div className="space-y-3 rounded-2xl border-2 border-makola-orange bg-orange-50 p-4 dark:bg-orange-950/30">
                <p className="text-sm font-bold text-makola-orange">Send Mobile Money to</p>
                <p className="text-lg font-bold text-makola-green dark:text-green-400">{momo.momoName}</p>
                <p className="text-xl font-extrabold">{momo.momoNumber}</p>
                <p className="text-xs text-gray-500">After sending, enter the Payment ID and Reference from your MoMo SMS / app.</p>
                <div>
                  <label className="mb-1 block text-sm font-bold text-makola-green dark:text-green-400">Payment / Transaction ID <span className="text-red-500">*</span></label>
                  <input className="input-lg" placeholder="e.g. 1234567890" value={momoTxnId} onChange={(e) => setMomoTxnId(e.target.value)} required={pay === "momo"} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-makola-green dark:text-green-400">Payment reference <span className="text-red-500">*</span></label>
                  <input className="input-lg" placeholder="e.g. Order for Lane 3 / your name" value={momoRef} onChange={(e) => setMomoRef(e.target.value)} required={pay === "momo"} />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40">{error}</div>
            )}

            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <div className="flex justify-between text-base"><span>Subtotal</span><span className="font-semibold">{formatGhs(subtotal)}</span></div>
              <div className="mt-1 flex justify-between text-base"><span>Delivery fee</span><span className="font-semibold">{formatGhs(fee)}</span></div>
              <div className="mt-2 flex justify-between border-t border-orange-100 pt-2 text-xl font-bold text-makola-green dark:border-zinc-700 dark:text-green-400"><span>Total</span><span>{formatGhs(total)}</span></div>
            </div>

            <button type="button" onClick={placeOrder} className="btn-orange w-full text-xl">Place Order</button>
            <a href={waLink(WHATSAPP_NUMBER, `I want to order: ${orderText}. Stall: ${stallNote}. Total ~${total} GHS. MoMo ID: ${momoTxnId || "\u2014"} Ref: ${momoRef || "\u2014"}`)} target="_blank" rel="noopener noreferrer" className="btn-green w-full text-lg">\ud83d\udcac Order via WhatsApp instead</a>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
