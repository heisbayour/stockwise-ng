"use client";
// src/app/(auth)/verify/page.tsx
import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
      if (res.ok) { setSuccess("New code sent! Check your email."); setCode(["", "", "", "", "", ""]); }
      else setError(data.error || "Failed to resend");
    } catch { setError("Network error."); }
    setResending(false);
  }

  return (
    <div className="auth-card text-center">
      <div className="auth-success-icon">
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h1 className="auth-card-title">Check your email</h1>
      <p className="auth-card-sub">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>

      <div className="otp-root" onPaste={handlePaste}>
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
            className={`otp-box ${digit ? "otp-box-filled" : ""}`}
          />
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="settings-msg-ok">{success}</p>}

      <button onClick={handleVerify} disabled={loading || code.join("").length !== 6} className="btn btn-primary btn-full">
        {loading ? (
          <>
            <svg className="btn-spinner" fill="none" viewBox="0 0 24 24">
              <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verifying...
          </>
        ) : "Verify Email"}
      </button>

      <p className="auth-footer-text">
        Did not receive it?{" "}
        <button onClick={handleResend} disabled={resending} className="form-link">
          {resending ? "Sending..." : "Resend code"}
        </button>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyForm /></Suspense>;
}
