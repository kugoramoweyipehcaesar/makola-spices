"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WHATSAPP_NUMBER, CALL_NUMBER } from "@/data/spices";
import { waLink } from "@/lib/utils";
import { ClipboardCheck, Package, Truck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] w-full bg-makola-cream pb-24 dark:bg-zinc-950">
      <header className="w-full bg-makola-orange px-4 pb-8 pt-4 text-white">
        <div className="flex w-full items-center justify-between gap-2">
          <BrandLogo href="/" light size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-semibold">Login</Link>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-4xl text-center">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            We Bring Spices To Your Shop — No Trotro!
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-orange-100 sm:text-base">
            Fresh ginger, prekese, anise seeds &amp; shito pepper delivered straight to your stall before dawn.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {[
              { e: "🫚", n: "Ginger" },
              { e: "🫘", n: "Prekese" },
              { e: "🌾", n: "Anise Seeds" },
              { e: "🌶️", n: "Shito Pepper" },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow sm:h-14 sm:w-14">{s.e}</div>
                <p className="mt-1 text-[10px] text-orange-100">{s.n}</p>
              </div>
            ))}
          </div>

          <a
            href={waLink(WHATSAPP_NUMBER, "Hello MAKOLA COMPANY LIMITED, I want to order spices.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-green mt-6 inline-flex w-full max-w-sm text-base sm:text-lg"
          >
            <span className="text-xl">💬</span> Order on WhatsApp
          </a>
          <p className="mt-2 text-sm text-orange-100">0548161539</p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl px-4 py-8">
        <h2 className="text-center text-xl font-bold text-makola-green dark:text-green-400 sm:text-2xl">
          How it works — simple for market women
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { color: "bg-makola-orange", icon: ClipboardCheck, title: "1. Order", desc: "Send your spice list on WhatsApp. We confirm price instantly." },
            { color: "bg-makola-green-light", icon: Package, title: "2. Pack", desc: "Hand-packed fresh, clean & safe in sealed bags." },
            { color: "bg-makola-orange", icon: Truck, title: "3. Deliver", desc: "To your market stall before 5am. No trotro needed." },
          ].map((s) => (
            <div key={s.title} className="flex gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:flex-col sm:items-center sm:text-center">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${s.color} text-white`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-makola-green dark:text-green-400 sm:text-lg">{s.title}</h3>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-zinc-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/shop" className="btn-orange text-center sm:min-w-[200px]">Shop Spices →</Link>
          <Link href="/signup" className="btn-outline text-center sm:min-w-[200px]">Create Account</Link>
        </div>
      </section>

      <footer className="w-full border-t border-orange-100 bg-makola-orange px-4 py-4 text-center text-sm text-white">
        Call/WhatsApp: <a href={`tel:${CALL_NUMBER}`} className="font-bold underline">{CALL_NUMBER}</a>
        <p className="mt-1 text-xs text-orange-100">MAKOLA COMPANY LIMITED © 2026</p>
      </footer>
      <BottomNav variant="home" />
    </div>
  );
}
