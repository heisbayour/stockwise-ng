// src/app/(main)/brokers/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatYears } from "@/lib/formatters";
import Link from "next/link";
import BrokerCTA from "@/components/broker/BrokerCTA";
import BrokerReviewSection from "@/components/broker/BrokerReviewSection";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const broker = await prisma.broker.findUnique({ where: { slug } });
  if (!broker) return { title: "Broker Not Found" };
  return {
    title: `${broker.name} Review - Fees, Requirements & Trust Score`,
    description: `${broker.shortDescription} Compare fees, account requirements, and read real user reviews for ${broker.name}.`,
  };
}

export default async function BrokerDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const broker = await prisma.broker.findUnique({
    where: { slug, isActive: true },
    include: {
      requirements: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { clicks: true } },
    },
  });

  if (!broker) notFound();

  const avgRating = broker.reviews.length
    ? broker.reviews.reduce((s, r) => s + r.rating, 0) / broker.reviews.length
    : 0;

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(avgRating));

  return (
    <main className="broker-detail-page">
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <svg className="breadcrumb-sep" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href="/brokers" className="breadcrumb-link">Brokers</Link>
          <svg className="breadcrumb-sep" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="breadcrumb-current">{broker.name}</span>
        </div>
      </div>

      <div className="broker-detail-inner">
        <div className="broker-detail-layout">
          <div className="broker-detail-main">
            <div className="broker-detail-header">
              <div className="broker-detail-badges">
                <span className={`badge ${broker.type === "DIGITAL" ? "badge-indigo" : "badge-slate"}`}>
                  {broker.type === "DIGITAL" ? "Digital Platform" : "Traditional Broker"}
                </span>
                {broker.secLicensed && (
                  <span className="badge badge-teal">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    SEC Licensed
                  </span>
                )}
              </div>

              <h1 className="broker-detail-h1">{broker.name}</h1>

              {broker.reviews.length > 0 && (
                <div className="broker-detail-rating">
                  <div className="broker-stars">
                    {stars.map((filled, i) => (
                      <svg key={i} width="16" height="16" className={filled ? "broker-star-filled" : "broker-star-empty"} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.176 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="broker-rating-text">{avgRating.toFixed(1)}</span>
                  <span className="broker-rating-count">({broker.reviews.length} review{broker.reviews.length !== 1 ? "s" : ""})</span>
                </div>
              )}
            </div>

            <section className="broker-section">
              <h2 className="broker-section-title">About {broker.name}</h2>
              <p className="broker-desc">{broker.description}</p>
            </section>

            <section className="broker-section">
              <h2 className="broker-section-title">Key Details</h2>
              <div className="broker-key-stats">
                {[
                  { label: "Min. Deposit", value: formatNaira(broker.minimumDeposit) },
                  { label: "Trading Fee", value: `${broker.tradingFeePercent}%` },
                  { label: "Years Active", value: formatYears(broker.yearsOperating) },
                  { label: "Trust Score", value: `${broker.trustScore}/100`, highlight: true },
                ].map((item) => (
                  <div key={item.label} className="broker-key-stat">
                    <p className="broker-key-stat-label">{item.label}</p>
                    <p className={`broker-key-stat-val font-mono ${item.highlight ? "broker-key-stat-teal" : ""}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {(broker.supportedAssets.length > 0 || broker.features.length > 0) && (
              <section className="broker-section">
                <h2 className="broker-section-title">What They Offer</h2>
                <div className="broker-offers-grid">
                  {broker.supportedAssets.length > 0 && (
                    <div>
                      <p className="broker-offers-sub">Supported Assets</p>
                      <div className="broker-tags">
                        {broker.supportedAssets.map((a) => (
                          <span key={a} className="broker-tag">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {broker.features.length > 0 && (
                    <div>
                      <p className="broker-offers-sub">Platform Features</p>
                      <div className="broker-tags">
                        {broker.features.map((f) => (
                          <span key={f} className="broker-tag broker-tag-teal">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {broker.requirements.length > 0 && (
              <section className="broker-section">
                <h2 className="broker-section-title">Account Opening Requirements</h2>
                <div className="req-list">
                  {broker.requirements.map((req) => (
                    <div key={req.id} className="req-item">
                      <div className={`req-icon ${req.isRequired ? "" : "req-icon-opt"}`}>
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="req-text">{req.item}{!req.isRequired && <span className="req-note"> (Optional)</span>}</p>
                        {req.note && <p className="req-note">{req.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <BrokerReviewSection
              brokerId={broker.id}
              reviews={broker.reviews}
              isLoggedIn={!!session}
              avgRating={avgRating}
            />
          </div>

          <div className="broker-cta-sidebar">
            <BrokerCTA broker={broker} userId={session?.user?.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
