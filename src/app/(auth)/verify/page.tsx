"use client";
// src/app/(auth)/verify/page.tsx
import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleInput(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    const newCode = [...pasted.split(""), ...Array(6).fill("")].slice(0, 6);
    setCode(newCode);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length !== 6) { setError("Please enter all 6 digits"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Verification failed"); setLoading(false); return; }
      router.push("/login?verified=true");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess("New code sent! Check your email."); setCode(["","","","","",""]); }
      else setError(data.error || "Failed to resend");
    } catch { setError("Network error."); }
    setResending(false);
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-[color:var(--color-teal-tint)]">
          <svg className="w-8 h-8 sw-text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2 sw-text-ink">Check your email</h1>
        <p className="text-sm text-gray-500 mb-8">
          We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
        </p>

        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-colors"
              style={{ borderColor: digit ? "var(--color-teal)" : "var(--color-line)", color: "var(--color-ink)", height: "52px" }}
            />
          ))}
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-4 text-sm sw-text-brand">{success}</p>}

        <button onClick={handleVerify} disabled={loading || code.join("").length !== 6}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-4 sw-btn-primary">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying...
            </span>
          ) : "Verify Email"}
        </button>

        <p className="text-sm text-gray-500">
          Did not receive it?{" "}
          <button onClick={handleResend} disabled={resending} className="font-semibold disabled:opacity-50 sw-text-brand">
            {resending ? "Sending..." : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyForm /></Suspense>;
}
