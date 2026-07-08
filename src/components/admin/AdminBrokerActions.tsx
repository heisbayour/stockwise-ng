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

  return (
    <div className="admin-action-row">
      <button onClick={() => action("setActive", !broker.isActive)} disabled={loading === "setActive"}
        className={`admin-btn ${broker.isActive ? "admin-btn-red" : "admin-btn-green"}`}>
        {loading === "setActive" ? "..." : broker.isActive ? "Hide" : "Show"}
      </button>

      <button onClick={() => action("setFeatured", !broker.isFeatured)} disabled={loading === "setFeatured"}
        className={`admin-btn ${broker.isFeatured ? "admin-btn-slate" : "admin-btn-indigo"}`}>
        {loading === "setFeatured" ? "..." : broker.isFeatured ? "Unfeature" : "Feature"}
      </button>

      {broker.pendingReviews > 0 && (
        <button onClick={approveAllReviews} disabled={loading === "reviews"} className="admin-btn admin-btn-gold">
          {loading === "reviews" ? "..." : `Approve ${broker.pendingReviews} reviews`}
        </button>
      )}
    </div>
  );
}
