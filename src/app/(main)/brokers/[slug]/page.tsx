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
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href="/brokers" className="hover:text-gray-700">Brokers</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{broker.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <h1 className="text-3xl font-bold sw-text-ink">{broker.name}</h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{
                  background: broker.type === "DIGITAL" ? "var(--color-indigo-tint)" : "var(--color-paper-dim)",
                  color: broker.type === "DIGITAL" ? "var(--color-indigo)" : "var(--color-ink-soft)",
                }}>
                  {broker.type === "DIGITAL" ? "Digital Platform" : "Traditional Broker"}
                </span>
                {broker.secLicensed && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold sw-badge-teal">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    SEC Licensed
                  </span>
                )}
              </div>

              {broker.reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {stars.map((filled, i) => (
                      <svg key={i} className="w-4 h-4" fill={filled ? "var(--color-warning)" : "var(--color-line)"} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.176 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({broker.reviews.length} review{broker.reviews.length !== 1 ? "s" : ""})</span>
                </div>
              )}
            </div>

            {/* About */}
            <section>
              <h2 className="text-lg font-semibold mb-3 sw-text-ink">About {broker.name}</h2>
              <p className="text-gray-600 leading-relaxed">{broker.description}</p>
            </section>

            {/* Quick stats */}
            <section>
              <h2 className="text-lg font-semibold mb-4 sw-text-ink">Key Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Min. Deposit", value: formatNaira(broker.minimumDeposit) },
                  { label: "Trading Fee", value: `${broker.tradingFeePercent}%` },
                  { label: "Years Active", value: formatYears(broker.yearsOperating) },
                  { label: "Trust Score", value: `${broker.trustScore}/100`, highlight: true },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-gray-100 text-center">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className={`text-lg font-bold ${item.highlight ? "" : "text-gray-900"}`}
                      style={item.highlight ? { color: "var(--color-teal)" } : {}}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* What they offer */}
            {(broker.supportedAssets.length > 0 || broker.features.length > 0) && (
              <section>
                <h2 className="text-lg font-semibold mb-4 sw-text-ink">What They Offer</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {broker.supportedAssets.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Supported Assets</p>
                      <div className="flex flex-wrap gap-2">
                        {broker.supportedAssets.map((a) => (
                          <span key={a} className="text-xs px-2.5 py-1 rounded-full font-medium sw-badge-slate">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {broker.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Platform Features</p>
                      <div className="flex flex-wrap gap-2">
                        {broker.features.map((f) => (
                          <span key={f} className="text-xs px-2.5 py-1 rounded-full font-medium sw-badge-teal">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Requirements */}
            {broker.requirements.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 sw-text-ink">Account Opening Requirements</h2>
                <div className="space-y-3">
                  {broker.requirements.map((req) => (
                    <div key={req.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: req.isRequired ? "var(--color-paper-dim)" : "var(--color-paper)" }}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${req.isRequired ? "bg-[color:var(--color-teal)]" : "bg-gray-200"}`}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{req.item}{!req.isRequired && <span className="text-xs text-gray-400 ml-1">(Optional)</span>}</p>
                        {req.note && <p className="text-xs text-gray-500 mt-0.5">{req.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <BrokerReviewSection
              brokerId={broker.id}
              reviews={broker.reviews}
              isLoggedIn={!!session}
              avgRating={avgRating}
            />
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-1">
            <BrokerCTA broker={broker} userId={session?.user?.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
