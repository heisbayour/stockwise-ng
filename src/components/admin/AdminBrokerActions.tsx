"use client";
// src/components/admin/AdminBrokerActions.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BrokerData { id: string; isActive: boolean; isFeatured: boolean; pendingReviews: number; }

export default function AdminBrokerActions({ broker }: { broker: BrokerData }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function action(type: string, value: boolean) {
    setLoading(type);
    try {
      await fetch(`/api/admin/brokers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerId: broker.id, action: type, value }),
      });
      router.refresh();
    } catch { /* silent */ }
    setLoading(null);
  }

  async function approveAllReviews() {
    setLoading("reviews");
    try {
      await fetch(`/api/admin/brokers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerId: broker.id, action: "approveReviews" }),
      });
      router.refresh();
    } catch { /* silent */ }
    setLoading(null);
  }

  const btnClass = "text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button onClick={() => action("setActive", !broker.isActive)} disabled={loading === "setActive"}
        className={btnClass}
        style={broker.isActive ? { borderColor: "var(--color-danger-border)", color: "var(--color-danger)" } : { borderColor: "var(--color-success-tint)", color: "var(--color-success)" }}>
        {loading === "setActive" ? "..." : broker.isActive ? "Hide" : "Show"}
      </button>

      <button onClick={() => action("setFeatured", !broker.isFeatured)} disabled={loading === "setFeatured"}
        className={btnClass}
        style={broker.isFeatured ? { borderColor: "var(--color-line)", color: "var(--color-ink-soft)" } : { borderColor: "var(--color-indigo-border)", color: "var(--color-indigo)" }}>
        {loading === "setFeatured" ? "..." : broker.isFeatured ? "Unfeature" : "Feature"}
      </button>

      {broker.pendingReviews > 0 && (
        <button onClick={approveAllReviews} disabled={loading === "reviews"}
          className={btnClass} style={{ borderColor: "var(--color-warning-border)", color: "var(--color-warning)" }}>
          {loading === "reviews" ? "..." : `Approve ${broker.pendingReviews} reviews`}
        </button>
      )}
    </div>
  );
}
