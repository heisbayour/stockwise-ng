"use client";
// src/components/admin/AdminUserActions.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  role: string;
  isActive: boolean;
  ninSubmitted: boolean;
  ninVerified: boolean;
  nin: string | null;
}

export default function AdminUserActions({ user }: { user: UserData }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function action(type: string, extra?: Record<string, unknown>) {
    setLoading(type);
    try {
      await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: type, ...extra }),
      });
      router.refresh();
    } catch { /* silent */ }
    setLoading(null);
  }

  const btnClass = "text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* NIN verification */}
      {user.ninSubmitted && !user.ninVerified && (
        <button onClick={() => action("verifyNin")} disabled={loading === "verifyNin"}
          className={btnClass} style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}>
          {loading === "verifyNin" ? "..." : "Verify NIN"}
        </button>
      )}

      {/* Role changes */}
      {user.role === "USER" && (
        <button onClick={() => action("setRole", { role: "AUTHOR" })} disabled={loading === "setRole"}
          className={btnClass} style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}>
          Make Author
        </button>
      )}
      {user.role === "AUTHOR" && (
        <button onClick={() => action("setRole", { role: "USER" })} disabled={loading === "setRole"}
          className={btnClass} style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }}>
          Revoke Author
        </button>
      )}
      {(user.role === "USER" || user.role === "AUTHOR") && (
        <button onClick={() => action("setRole", { role: "ADMIN" })} disabled={loading === "setRole"}
          className={btnClass} style={{ borderColor: "var(--color-info)", color: "var(--color-info)" }}>
          Make Admin
        </button>
      )}
      {user.role === "ADMIN" && (
        <button onClick={() => action("setRole", { role: "USER" })} disabled={loading === "setRole"}
          className={btnClass} style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }}>
          Remove Admin
        </button>
      )}

      {/* Suspend / activate - never allow on SUPERUSER */}
      {user.role !== "SUPERUSER" && (
        <button onClick={() => action(user.isActive ? "suspend" : "activate")}
          disabled={loading === "suspend" || loading === "activate"}
          className={btnClass}
          style={user.isActive ? { borderColor: "var(--color-danger-border)", color: "var(--color-danger)" } : { borderColor: "var(--color-success-tint)", color: "var(--color-success)" }}>
          {user.isActive ? "Suspend" : "Activate"}
        </button>
      )}
    </div>
  );
}
