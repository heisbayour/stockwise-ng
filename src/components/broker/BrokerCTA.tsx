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
    try {
      await fetch(`/api/brokers/${broker.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch { /* non-blocking - still open the link */ }

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

  const score = broker.trustScore ?? 0;
  const scoreTier = score >= 80 ? "" : score >= 60 ? "warning" : "danger";

  return (
    <div className="broker-cta-card">
      <div className="broker-cta-score">
        <div className="broker-cta-score-row">
          <span className="broker-cta-score-label">Trust Score</span>
          <span className={`broker-cta-score-val font-mono ${scoreTier ? `broker-cta-score-val-${scoreTier}` : ""}`}>{score}/100</span>
        </div>
        <div className="broker-cta-score-bar">
          {/* Width is per-broker numeric data and can't be a static class -
              this is the one unavoidable inline style in the app. */}
          <div
            className={`broker-cta-score-fill ${scoreTier ? `broker-cta-score-fill-${scoreTier}` : ""}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="broker-cta-fees">
        {[
          { label: "Minimum Deposit", value: formatNaira(broker.minimumDeposit) },
          { label: "Trading Fee", value: `${broker.tradingFeePercent}% per trade` },
          { label: "Account Opening", value: broker.accountOpeningFee === 0 ? "Free" : formatNaira(broker.accountOpeningFee) },
          { label: "Years Operating", value: formatYears(broker.yearsOperating) },
        ].map((item) => (
          <div key={item.label} className="broker-cta-fee-row">
            <span className="broker-cta-fee-label">{item.label}</span>
            <span className="broker-cta-fee-val font-mono">{item.value}</span>
          </div>
        ))}
        {broker.accountTypes.length > 0 && (
          <div className="broker-cta-fee-row">
            <span className="broker-cta-fee-label">Account Types</span>
            <span className="broker-cta-fee-val">{broker.accountTypes.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="broker-cta-actions">
        <button onClick={handleOpenAccount} className="broker-open-btn">
          Open Account with {broker.name}
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>

        <button onClick={handleSave} disabled={saving} className={`broker-save-btn ${saved ? "broker-save-btn-saved" : ""}`}>
          <svg width="16" height="16" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {saved ? "Saved" : "Save Broker"}
        </button>

        <p className="broker-cta-note">
          You will be redirected to {broker.name}&apos;s official platform. Stockwise does not handle account opening.
        </p>
      </div>
    </div>
  );
}
