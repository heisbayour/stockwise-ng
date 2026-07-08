"use client";
// src/app/(auth)/register/page.tsx
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: "" }));
  }

  function validateStep1() {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Enter a valid email address";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 8) errs.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(formData.password)) errs.password = "Password must have at least one uppercase letter";
    else if (!/[0-9]/.test(formData.password)) errs.password = "Password must have at least one number";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep1()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setFieldErrors(data.fields);
        else setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      router.push(`/verify?userId=${data.userId}&email=${encodeURIComponent(formData.email)}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const strengthScore = () => {
    let s = 0;
    if (formData.password.length >= 8) s++;
    if (/[A-Z]/.test(formData.password)) s++;
    if (/[0-9]/.test(formData.password)) s++;
    if (/[^A-Za-z0-9]/.test(formData.password)) s++;
    return s;
  };

  const tiers = ["", "weak", "fair", "good", "strong"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const score = strengthScore();
  const tier = tiers[score];

  return (
    <div className="auth-card">
      <h1 className="auth-card-title">Create your account</h1>
      <p className="auth-card-sub">Start your investing journey - it is free</p>

      {error && (
        <div className="alert alert-error">
          <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div>
            <label className="form-label">First name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange}
              placeholder="Emeka" className={`form-input ${fieldErrors.firstName ? "form-input-error" : ""}`} />
            {fieldErrors.firstName && <p className="form-error">{fieldErrors.firstName}</p>}
          </div>
          <div>
            <label className="form-label">Last name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange}
              placeholder="Okafor" className={`form-input ${fieldErrors.lastName ? "form-input-error" : ""}`} />
            {fieldErrors.lastName && <p className="form-error">{fieldErrors.lastName}</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange}
            placeholder="emeka@example.com" className={`form-input ${fieldErrors.email ? "form-input-error" : ""}`} />
          {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Phone number <span className="form-hint">(optional)</span></label>
          <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
            placeholder="08012345678" className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="form-input-wrap">
            <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange}
              placeholder="Min. 8 characters" className={`form-input ${fieldErrors.password ? "form-input-error" : ""}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="form-eye-btn">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                }
              </svg>
            </button>
          </div>
          {formData.password && (
            <>
              <div className="pw-strength-bars">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`pw-bar ${i <= score ? `pw-bar-${tier}` : ""}`} />
                ))}
              </div>
              <p className={`pw-label-${tier}`}>{strengthLabels[score]}</p>
            </>
          )}
          {fieldErrors.password && <p className="form-error">{fieldErrors.password}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm password</label>
          <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}
            placeholder="Repeat your password" className={`form-input ${fieldErrors.confirmPassword ? "form-input-error" : ""}`} />
          {fieldErrors.confirmPassword && <p className="form-error">{fieldErrors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-full">
          {loading ? (
            <>
              <svg className="btn-spinner" fill="none" viewBox="0 0 24 24">
                <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : "Create Free Account"}
        </button>
      </form>

      <p className="form-hint">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="form-link">Terms</Link> and{" "}
        <Link href="/privacy" className="form-link">Privacy Policy</Link>
      </p>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link href="/login" className="form-link">Sign in</Link>
      </p>
    </div>
  );
}
