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

  const activeType = params.type ?? "";

  return (
    <main className="brokers-page">
      <div className="brokers-header-section">
        <div className="sw-container">
          <h1 className="brokers-title">Nigerian Stock Brokers</h1>
          <p className="brokers-sub">Compare {brokers.length} SEC-licensed brokers and find the right one for you</p>
        </div>
      </div>

      <div className="brokers-body">
        <div className="sw-container">
          <div className="brokers-layout">
            <aside className="brokers-filters-col">
              <div className="filter-card">
                <h3 className="filter-title">Filters</h3>

                <form method="GET" className="search-bar-wrap">
                  <input name="q" defaultValue={params.q} placeholder="Search brokers..." className="search-bar" />
                  {params.type && <input type="hidden" name="type" value={params.type} />}
                  {params.secOnly && <input type="hidden" name="secOnly" value={params.secOnly} />}
                  {params.sort && <input type="hidden" name="sort" value={params.sort} />}
                </form>

                <div className="filter-group">
                  <p className="filter-group-label">Broker Type</p>
                  {[{ label: "All", value: "" }, { label: "Traditional", value: "TRADITIONAL" }, { label: "Digital", value: "DIGITAL" }].map((opt) => (
                    <Link key={opt.value} href={`/brokers?${new URLSearchParams({ ...params, type: opt.value }).toString()}`}
                      className={activeType === opt.value ? "filter-radio-item filter-radio-active" : "filter-radio-item"}>
                      <span className={activeType === opt.value ? "filter-radio-dot filter-radio-dot-active" : "filter-radio-dot"} />
                      {opt.label}
                    </Link>
                  ))}
                </div>

                <div className="filter-group">
                  <p className="filter-group-label">Verification</p>
                  <Link href={`/brokers?${new URLSearchParams({ ...params, secOnly: params.secOnly === "true" ? "" : "true" }).toString()}`}
                    className="filter-checkbox-item">
                    <div className={params.secOnly === "true" ? "filter-checkbox filter-checkbox-active" : "filter-checkbox"}>
                      {params.secOnly === "true" && (
                        <svg width="10" height="10" fill="white" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    SEC Licensed only
                  </Link>
                </div>

                <div className="filter-group">
                  <p className="filter-group-label">Sort By</p>
                  <SortSelect currentSort={params.sort ?? "trustScore"} currentParams={params} />
                </div>

                {(params.type || params.secOnly || params.sort || params.q) && (
                  <Link href="/brokers" className="filter-clear">Clear all filters</Link>
                )}
              </div>
            </aside>

            <div className="brokers-results-col">
              {brokersWithStats.length === 0 ? (
                <div className="broker-empty">
                  <p>No brokers match your filters.</p>
                  <Link href="/brokers" className="form-link">Clear filters</Link>
                </div>
              ) : (
                <div className="broker-grid">
                  {brokersWithStats.map((broker) => (
                    <Link key={broker.id} href={`/brokers/${broker.slug}`} className="broker-card-dir">
                      <div className="broker-card-head">
                        <div>
                          <h3 className="broker-card-name">{broker.name}</h3>
                          <span className={`badge broker-card-type ${broker.type === "DIGITAL" ? "badge-indigo" : "badge-slate"}`}>
                            {broker.type === "DIGITAL" ? "Digital" : "Traditional"}
                          </span>
                        </div>
                        {broker.secLicensed && (
                          <span className="badge badge-gold">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            SEC
                          </span>
                        )}
                      </div>

                      <p className="broker-card-desc">{broker.shortDescription}</p>

                      <div className="broker-card-stats">
                        <div className="broker-stat">
                          <p className="broker-stat-label">Min. Deposit</p>
                          <p className="broker-stat-val font-mono">{formatNaira(broker.minimumDeposit)}</p>
                        </div>
                        <div className="broker-stat">
                          <p className="broker-stat-label">Trading Fee</p>
                          <p className="broker-stat-val font-mono">{broker.tradingFeePercent}%</p>
                        </div>
                        <div className="broker-stat">
                          <p className="broker-stat-label">Trust Score</p>
                          <p className="broker-stat-val broker-stat-teal font-mono">{broker.trustScore}/100</p>
                        </div>
                        <div className="broker-stat">
                          <p className="broker-stat-label">Reviews</p>
                          <p className="broker-stat-val font-mono">
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
      </div>
    </main>
  );
}
