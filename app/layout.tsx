import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MAKOLA COMPANY LIMITED | Spices Direct Ghana",
  description: "Fresh spices delivered to market stalls in Makola before 5am. WhatsApp 0548161539.",
  manifest: "/manifest.json",
  themeColor: "#E67E22",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} min-h-[100dvh] w-full overflow-x-hidden bg-makola-cream text-gray-900 antialiased dark:bg-zinc-950 dark:text-zinc-100`}>
        <Providers>
          <div className="w-full min-h-[100dvh]">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
