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
    <div className="auth-card">
      {step === "done" ? (
        <div className="text-center">
          <div className="auth-success-icon">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="auth-card-title">Password reset!</h1>
          <p className="auth-card-sub">Your password has been updated successfully.</p>
          <Link href="/login" className="btn btn-primary btn-full">Sign In Now</Link>
        </div>
      ) : (
        <>
          <h1 className="auth-card-title">
            {step === "email" ? "Reset your password" : step === "code" ? "Enter reset code" : "Set new password"}
          </h1>
          <p className="auth-card-sub">
            {step === "email" ? "Enter your email and we'll send a reset code"
              : step === "code" ? `We sent a code to ${email}`
              : "Choose a strong new password"}
          </p>

          {error && (
            <div className="alert alert-error">
              <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="you@example.com" className="form-input" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {step === "code" && (
            <div>
              <div className="form-group">
                <label className="form-label">6-digit code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="000000" maxLength={6} className="form-input form-input-code" />
              </div>
              <button onClick={() => { if (code.length === 6) setStep("reset"); else setError("Enter the 6-digit code"); }}
                className="btn btn-primary btn-full">
                Continue
              </button>
            </div>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                  placeholder="Min. 8 characters" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  placeholder="Repeat password" className="form-input" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="auth-footer-text">
            <Link href="/login" className="form-link">Back to Sign In</Link>
          </p>
        </>
      )}
    </div>
  );
}
