"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith("/admin/login")) {
    return <>{children}</>;
  }
  return (
    <div className="min-h-[100dvh]">
      <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-center dark:bg-red-950/40">
        <Link
          href="/admin/maintenance"
          className="text-sm font-bold text-red-700 underline hover:text-red-900"
        >
          ⚙ Maintenance — Reset all orders permanently
        </Link>
      </div>
      {children}
    </div>
  );
}
