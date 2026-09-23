"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const SHOP_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/orders/history", label: "Orders", icon: ClipboardList },
  { href: "/account", label: "Account", icon: User },
];

const RIDER_ITEMS = [
  { href: "/orders/history", label: "Orders", icon: ClipboardList },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav({ variant = "shop" }: { variant?: "shop" | "home" }) {
  const path = usePathname();
  const { user } = useAuth();
  const isRider = user?.role === "RIDER";

  const items = isRider
    ? RIDER_ITEMS
    : variant === "home"
      ? [
          { href: "/", label: "Home", icon: Home },
          { href: "/orders/history", label: "Orders", icon: ClipboardList },
          { href: "/account", label: "Account", icon: User },
        ]
      : SHOP_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 w-full border-t border-orange-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex w-full">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? path === "/"
              : path.startsWith(item.href) ||
                (item.href === "/orders/history" && path.startsWith("/orders"));
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium",
                active ? "text-makola-orange" : "text-gray-400"
              )}
            >
              <item.icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
