"use client";
// src/components/dashboard/WatchlistManager.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

interface WatchlistItem { id: string; ticker: string; companyName: string; }

export default function WatchlistManager({ initialItems }: { initialItems: WatchlistItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [ticker, setTicker] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim() || !company.trim()) { setError("Both fields are required"); return; }
    setError(""); setAdding(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase().trim(), companyName: company.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add"); setAdding(false); return; }
      setItems((prev) => [data.item, ...prev]);
      setTicker(""); setCompany("");
      router.refresh();
    } catch { setError("Network error. Please try again."); }
    setAdding(false);
  }

  async function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
      router.refresh();
    } catch { router.refresh(); }
  }

  return (
    <div>
      <div className="watchlist-add-card">
        <h3 className="watchlist-add-title">Add a Stock</h3>
        <form onSubmit={handleAdd}>
          <div className="watchlist-add-row">
            <div className="form-group">
              <label className="form-label">Ticker</label>
              <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="MTNN" maxLength={10} className="form-input font-mono" />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="MTN Nigeria Communications" className="form-input" />
            </div>
            <button type="submit" disabled={adding} className="btn btn-primary">
              {adding ? (
                <svg className="btn-spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              Add
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>

        <div className="watchlist-hint">
          Common NGX tickers: DANGCEM, GTCO, MTNN, ZENITHBANK, ACCESS, AIRTELAFRI, SEPLAT, BUACEMENT
        </div>
      </div>

      {items.length === 0 ? (
        <div className="watchlist-table">
          <div className="dash-empty">
            <p>Your watchlist is empty. Add stocks above to track them.</p>
          </div>
        </div>
      ) : (
        <div className="watchlist-table">
          <div className="watchlist-table-head">
            <span className="watchlist-table-head-cell">Ticker</span>
            <span className="watchlist-table-head-cell">Company</span>
            <span className="watchlist-table-head-cell">Action</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="watchlist-table-row">
              <span className="watchlist-ticker">{item.ticker}</span>
              <span className="watchlist-company">{item.companyName}</span>
              <button onClick={() => handleRemove(item.id)} className="btn-remove">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
