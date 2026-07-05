"use client";
// src/components/broker/BrokerCTA.tsx
import { useState } from "react";
import { formatNaira, formatYears } from "@/lib/formatters";

interface Props {
  broker: {
    id: string;
    name: string;
    website: string;
    referralLink: string | null;
    minimumDeposit: number | null;
    tradingFeePercent: number | null;
    accountOpeningFee: number | null;
    yearsOperating: number | null;
    trustScore: number | null;
    accountTypes: string[];
  };
  userId?: string;
}

export default function BrokerCTA({ broker, userId }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleOpenAccount() {
    // Track the click for referral analytics
    try {
      await fetch(`/api/brokers/${broker.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch { /* non-blocking - still open the link */ }

    // Open the referral link in a new tab
    window.open(broker.referralLink || broker.website, "_blank", "noopener,noreferrer");
  }

  async function handleSave() {
    if (!userId) { window.location.href = "/login"; return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/brokers/${broker.id}/save`, { method: "POST" });
      const data = await res.json();
      setSaved(data.saved);
    } catch { /* silent fail */ }
    setSaving(false);
  }

  const scoreColor = (broker.trustScore ?? 0) >= 80 ? "var(--color-teal)" : (broker.trustScore ?? 0) >= 60 ? "var(--color-warning)" : "var(--color-red)";

  return (
    <div className="sticky top-20">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Trust score banner */}
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Trust Score</span>
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>{broker.trustScore ?? 0}/100</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${broker.trustScore ?? 0}%`, background: scoreColor }} />
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="p-5 space-y-3 border-b border-gray-50">
          {[
            { label: "Minimum Deposit", value: formatNaira(broker.minimumDeposit) },
            { label: "Trading Fee", value: `${broker.tradingFeePercent}% per trade` },
            { label: "Account Opening", value: broker.accountOpeningFee === 0 ? "Free" : formatNaira(broker.accountOpeningFee) },
            { label: "Years Operating", value: formatYears(broker.yearsOperating) },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
          {broker.accountTypes.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Account Types</span>
              <span className="font-semibold text-gray-900 text-right max-w-32">{broker.accountTypes.join(", ")}</span>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="p-5 space-y-3">
          <button onClick={handleOpenAccount}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 sw-btn-primary">
            Open Account with {broker.name}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          <button onClick={handleSave} disabled={saving}
            className={`w-full py-3 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2 text-sm ${
              saved ? "border-[color:var(--color-teal)] text-[color:var(--color-teal)] bg-[color:var(--color-teal-tint)]" : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
            <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {saved ? "Saved" : "Save Broker"}
          </button>

          <p className="text-xs text-center text-gray-400 leading-relaxed">
            You will be redirected to {broker.name}'s official platform. Stockwise does not handle account opening.
          </p>
        </div>
      </div>
    </div>
  );
}
