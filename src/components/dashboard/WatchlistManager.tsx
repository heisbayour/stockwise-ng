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
    } catch { /* re-fetch on error */ router.refresh(); }
  }

  return (
    <div className="space-y-5">
      {/* Add form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Add a Stock</h3>
        <form onSubmit={handleAdd}>
          <div className="grid sm:grid-cols-[120px_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Ticker</label>
              <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="MTNN" maxLength={10}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Company Name</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="MTN Nigeria Communications"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
            </div>
            <button type="submit" disabled={adding}
              className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60 flex items-center gap-2 sw-btn-primary">
              {adding ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              Add
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </form>

        <div className="mt-4 p-3 rounded-xl text-xs text-gray-500" style={{ background: "var(--color-paper-dim)" }}>
          Common NGX tickers: DANGCEM, GTCO, MTNN, ZENITHBANK, ACCESS, AIRTELAFRI, SEPLAT, BUACEMENT
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 text-sm">Your watchlist is empty. Add stocks above to track them.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_auto] gap-4 px-5 py-3 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticker</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[80px_1fr_auto] gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <span className="font-bold text-sm font-mono sw-text-ink">{item.ticker}</span>
              <span className="text-sm text-gray-700">{item.companyName}</span>
              <button onClick={() => handleRemove(item.id)}
                className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
