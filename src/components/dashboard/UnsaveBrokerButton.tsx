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
    <button onClick={handleRemove} disabled={loading} className="btn-remove">
      {loading ? "..." : "Remove"}
    </button>
  );
}
