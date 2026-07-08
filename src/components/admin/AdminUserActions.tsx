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

  return (
    <div className="admin-action-row">
      {/* NIN verification */}
      {user.ninSubmitted && !user.ninVerified && (
        <button onClick={() => action("verifyNin")} disabled={loading === "verifyNin"} className="admin-btn admin-btn-teal">
          {loading === "verifyNin" ? "..." : "Verify NIN"}
        </button>
      )}

      {/* Role changes */}
      {user.role === "USER" && (
        <button onClick={() => action("setRole", { role: "AUTHOR" })} disabled={loading === "setRole"} className="admin-btn admin-btn-gold">
          Make Author
        </button>
      )}
      {user.role === "AUTHOR" && (
        <button onClick={() => action("setRole", { role: "USER" })} disabled={loading === "setRole"} className="admin-btn admin-btn-slate">
          Revoke Author
        </button>
      )}
      {(user.role === "USER" || user.role === "AUTHOR") && (
        <button onClick={() => action("setRole", { role: "ADMIN" })} disabled={loading === "setRole"} className="admin-btn admin-btn-indigo">
          Make Admin
        </button>
      )}
      {user.role === "ADMIN" && (
        <button onClick={() => action("setRole", { role: "USER" })} disabled={loading === "setRole"} className="admin-btn admin-btn-slate">
          Remove Admin
        </button>
      )}

      {/* Suspend / activate - never allow on SUPERUSER */}
      {user.role !== "SUPERUSER" && (
        <button onClick={() => action(user.isActive ? "suspend" : "activate")}
          disabled={loading === "suspend" || loading === "activate"}
          className={`admin-btn ${user.isActive ? "admin-btn-red" : "admin-btn-green"}`}>
          {user.isActive ? "Suspend" : "Activate"}
        </button>
      )}
    </div>
  );
}
