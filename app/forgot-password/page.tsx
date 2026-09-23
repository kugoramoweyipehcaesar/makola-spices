"use client";

import { useState } from "react";
import Link from "next/link";
import { CALL_NUMBER, WHATSAPP_NUMBER } from "@/data/spices";
import { waLink } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [id, setId] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-makola-cream px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <BrandLogo href="/" size="sm" />
        <h1 className="mt-4 text-xl font-bold text-makola-green">Forgot password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your phone or email. We will help you reset via WhatsApp or call.
        </p>
        {sent ? (
          <div className="mt-6 space-y-3">
            <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
              Request noted for <strong>{id}</strong>. Contact us on WhatsApp or call{" "}
              <strong>{CALL_NUMBER}</strong>.
            </p>
            <a href={waLink(WHATSAPP_NUMBER, `Password reset for ${id}`)} target="_blank" rel="noopener noreferrer" className="btn-green w-full">
              Message on WhatsApp
            </a>
            <Link href="/login" className="btn-outline w-full text-center">Back to login</Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <input className="input-lg" placeholder="Phone or email" value={id} onChange={(e) => setId(e.target.value)} required />
            <button type="submit" className="btn-orange w-full">Request reset</button>
            <Link href="/login" className="block text-center text-sm text-makola-orange">← Back to login</Link>
          </form>
        )}
      </div>
    </div>
  );
}
