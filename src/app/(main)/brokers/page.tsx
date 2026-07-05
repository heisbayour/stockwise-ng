// src/app/(main)/brokers/page.tsx
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { formatNaira } from "@/lib/formatters";
import SortSelect from "@/components/broker/SortSelect";

export const metadata: Metadata = {
  title: "Compare Nigerian Stock Brokers - SEC Licensed",
  description: "Compare all SEC-licensed Nigerian stock brokers. Filter by type, minimum deposit, and features. Find the right broker for your investment journey.",
};

interface Props {
  searchParams: Promise<{ type?: string; secOnly?: string; sort?: string; q?: string }>;
}

export default async function BrokersPage({ searchParams }: Props) {
  const params = await searchParams;

  const where: Prisma.BrokerWhereInput = {
    isActive: true,
    ...(params.type === "DIGITAL" || params.type === "TRADITIONAL" ? { type: params.type } : {}),
    ...(params.secOnly === "true" ? { secLicensed: true } : {}),
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" } } : {}),
  };

  const orderBy: Prisma.BrokerOrderByWithRelationInput =
    params.sort === "minDeposit" ? { minimumDeposit: "asc" }
    : params.sort === "name" ? { name: "asc" }
    : { trustScore: "desc" };

  const brokers = await prisma.broker.findMany({
    where, orderBy,
    include: {
      reviews: { select: { rating: true } },
      _count: { select: { clicks: true } },
    },
  });

  const brokersWithStats = brokers.map((b) => ({
    ...b,
    avgRating: b.reviews.length ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0,
    reviewCount: b.reviews.length,
  }));

  return (
    <main className="min-h-screen bg-[color:var(--color-paper)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold sw-text-ink">Nigerian Stock Brokers</h1>
          <p className="mt-2 text-gray-500">Compare {brokers.length} SEC-licensed brokers and find the right one for you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Search */}
              <form method="GET" className="mb-5">
                <input name="q" defaultValue={params.q} placeholder="Search brokers..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "var(--color-teal)" } as any} />
                {params.type && <input type="hidden" name="type" value={params.type} />}
                {params.secOnly && <input type="hidden" name="secOnly" value={params.secOnly} />}
                {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              </form>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Broker Type</p>
                  {[{ label: "All", value: "" }, { label: "Traditional", value: "TRADITIONAL" }, { label: "Digital", value: "DIGITAL" }].map((opt) => (
                    <Link key={opt.value} href={`/brokers?${new URLSearchParams({ ...params, type: opt.value }).toString()}`}
                      className={`flex items-center gap-2 py-1.5 text-sm rounded-lg px-2 mb-0.5 transition-colors ${
                        (params.type ?? "") === opt.value ? "font-medium" : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={(params.type ?? "") === opt.value ? { color: "var(--color-teal)", background: "var(--color-teal-tint)" } : {}}>
                      <span className={`w-3 h-3 rounded-full border-2 ${(params.type ?? "") === opt.value ? "border-[color:var(--color-teal)] bg-[color:var(--color-teal)]" : "border-gray-300"}`} />
                      {opt.label}
                    </Link>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Verification</p>
                  <Link href={`/brokers?${new URLSearchParams({ ...params, secOnly: params.secOnly === "true" ? "" : "true" }).toString()}`}
                    className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${params.secOnly === "true" ? "border-[color:var(--color-teal)] bg-[color:var(--color-teal)]" : "border-gray-300"}`}>
                      {params.secOnly === "true" && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                    </div>
                    SEC Licensed only
                  </Link>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[color:var(--color-ink-soft)] uppercase tracking-wider mb-2">Sort By</p>
                  <SortSelect currentSort={params.sort ?? "trustScore"} currentParams={params} />
                </div>

                {(params.type || params.secOnly || params.sort || params.q) && (
                  <Link href="/brokers" className="block text-xs font-medium text-center py-2 rounded-lg sw-badge-danger">
                    Clear all filters
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {brokersWithStats.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-gray-500">No brokers match your filters.</p>
                <Link href="/brokers" className="mt-3 inline-block text-sm font-medium sw-text-brand">Clear filters</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {brokersWithStats.map((broker) => (
                  <Link key={broker.id} href={`/brokers/${broker.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[color:var(--color-teal)] transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{broker.name}</h3>
                        <span className="inline-flex items-center mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{
                          background: broker.type === "DIGITAL" ? "var(--color-indigo-tint)" : "var(--color-paper-dim)",
                          color: broker.type === "DIGITAL" ? "var(--color-indigo)" : "var(--color-ink-soft)",
                        }}>
                          {broker.type === "DIGITAL" ? "Digital" : "Traditional"}
                        </span>
                      </div>
                      {broker.secLicensed && (
                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 sw-badge-teal">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          SEC
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{broker.shortDescription}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-gray-400">Min. Deposit</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{formatNaira(broker.minimumDeposit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Trading Fee</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{broker.tradingFeePercent}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Trust Score</p>
                        <p className="font-semibold mt-0.5 sw-text-brand">{broker.trustScore}/100</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Reviews</p>
                        <p className="font-semibold text-gray-900 mt-0.5">
                          {broker.reviewCount > 0 ? `${broker.avgRating.toFixed(1)} (${broker.reviewCount})` : "No reviews yet"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
