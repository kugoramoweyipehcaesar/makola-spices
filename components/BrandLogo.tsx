"use client";

import Link from "next/link";
import { useState } from "react";

export function BrandLogo({
  href = "/",
  size = "md",
  light = false,
  showText = true,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  light?: boolean;
  showText?: boolean;
}) {
  const [ok, setOk] = useState(true);
  const box = { sm: 36, md: 44, lg: 64 }[size];
  const text = light ? "text-white" : "text-makola-green dark:text-green-400";
  const sub = light ? "text-orange-100" : "text-makola-orange";

  return (
    <Link href={href} className="flex min-w-0 items-center gap-2">
      <div
        className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-makola-orange/40"
        style={{ width: box, height: box }}
      >
        {ok ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo.png"
            alt="Makola Spices Direct"
            className="h-full w-full object-contain p-0.5"
            onError={() => setOk(false)}
          />
        ) : (
          <span className="text-lg">🫙</span>
        )}
      </div>
      {showText && (
        <div className="min-w-0 leading-tight">
          <p className={`truncate text-xs font-extrabold sm:text-sm ${text}`}>MAKOLA</p>
          <p className={`truncate text-[10px] font-semibold ${sub}`}>Spices Direct · Ghana</p>
        </div>
      )}
    </Link>
  );
}
