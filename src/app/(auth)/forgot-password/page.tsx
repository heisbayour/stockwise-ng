"use client";
// src/app/(auth)/forgot-password/page.tsx
import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "code" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); setLoading(false); return; }
      setUserId(data.userId);
      setStep("code");
    } catch { setError("Network error."); }
    setLoading(false);
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) { setError("Passwords do not match"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed"); setLoading(false); return; }
      setStep("done");
    } catch { setError("Network error."); }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {step === "done" ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-[color:var(--color-teal-tint)]">
              <svg className="w-8 h-8 sw-text-brand" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 sw-text-ink">Password reset!</h1>
            <p className="text-gray-500 mb-6">Your password has been updated successfully.</p>
            <Link href="/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl font-semibold text-white sw-btn-primary">
              Sign In Now
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold sw-text-ink">
                {step === "email" ? "Reset your password" : step === "code" ? "Enter reset code" : "Set new password"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {step === "email" ? "Enter your email and we'll send a reset code"
                  : step === "code" ? `We sent a code to ${email}`
                  : "Choose a strong new password"}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl text-sm sw-badge-danger">{error}</div>
            )}

            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60 sw-btn-primary">
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            )}

            {step === "code" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">6-digit code</label>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="000000" maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-center tracking-widest text-xl font-bold focus:outline-none focus:ring-2" />
                </div>
                <button onClick={() => { if (code.length === 6) setStep("reset"); else setError("Enter the 6-digit code"); }}
                  className="w-full py-3 rounded-xl font-semibold text-white sw-btn-primary">
                  Continue
                </button>
              </div>
            )}

            {step === "reset" && (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60 sw-btn-primary">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              <Link href="/login" className="font-semibold sw-text-brand">Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
