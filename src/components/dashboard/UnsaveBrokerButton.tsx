"use client";
// src/components/dashboard/UnsaveBrokerButton.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UnsaveBrokerButton({ brokerId }: { brokerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  async function handleRemove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/brokers/${brokerId}/save`, { method: "POST" });
      if (res.ok) { setHidden(true); router.refresh(); }
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <button onClick={handleRemove} disabled={loading}
      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
      {loading ? "..." : "Remove"}
    </button>
  );
}
