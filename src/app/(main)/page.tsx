// src/app/(main)/page.tsx
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatNaira } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Stockwise - Find SEC-Licensed Nigerian Stock Brokers",
  description: "Compare SEC-licensed Nigerian stock brokers, learn how to invest on the NGX, and start your investment journey with confidence.",
};

export default async function HomePage() {
  const [featuredBrokers, lessons, totalBrokers] = await Promise.all([
    prisma.broker.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { displayOrder: "asc" },
      take: 3,
    }),
    prisma.article.findMany({
      where: { isPublished: true, category: "LESSON" },
      orderBy: { lessonNumber: "asc" },
      take: 3,
    }),
    prisma.broker.count({ where: { isActive: true } }),
  ]);

  return (
    <main className="bg-[color:var(--color-paper)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--color-ink)]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28 pb-56 sm:pb-64">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-7 border border-[color:var(--color-gold)]/30 bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-gold)] animate-pulse" />
              <span className="sw-figure">{totalBrokers}</span> SEC-Licensed Brokers Listed
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-white leading-[1.08]">
              Invest in Nigeria&apos;s future.{" "}
              <span className="text-[color:var(--color-teal)]">The right way.</span>
            </h1>

            <p className="mt-6 text-lg text-[color:var(--color-on-ink)] leading-relaxed max-w-2xl">
              Stockwise connects you to verified, SEC-licensed Nigerian stock brokers. Compare fees, read real reviews, learn how investing works, and start your journey with confidence.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/brokers"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all bg-[color:var(--color-teal)] hover:bg-[color:var(--color-teal-deep)]"
              >
                Find a Broker
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/learn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border border-white/15 bg-white/5 text-white transition-all hover:bg-white/10"
              >
                Learn Investing Free
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-[color:var(--color-on-ink-muted)]">
              {[
                { text: "SEC-Licensed Brokers Only" },
                { text: "Real User Reviews" },
                { text: "100% Free to Use" },
              ].map((item) => (
                <span key={item.text} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[color:var(--color-teal)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Signature: Lagos skyline silhouette with a rising ticker line drawn
            across it -- the market at ground level, not a generic gradient. */}
        <svg
          className="absolute bottom-0 left-0 w-full h-48 sm:h-56"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 240 L0 170 L40 170 L40 140 L80 140 L80 190 L130 190 L130 110 L150 110 L150 90 L170 90 L170 150 L220 150 L220 120 L260 120 L260 200 L300 200 L300 100 L320 100 L320 80 L340 80 L340 130 L390 130 L390 160 L430 160 L430 60 L450 60 L450 40 L470 40 L470 100 L520 100 L520 175 L560 175 L560 145 L600 145 L600 200 L650 200 L650 115 L670 115 L670 95 L690 95 L690 155 L740 155 L740 70 L760 70 L760 50 L780 50 L780 110 L820 110 L820 185 L870 185 L870 130 L910 130 L910 190 L960 190 L960 90 L980 90 L980 65 L1000 65 L1000 140 L1050 140 L1050 165 L1100 165 L1100 105 L1140 105 L1140 195 L1190 195 L1190 120 L1230 120 L1230 150 L1280 150 L1280 85 L1310 85 L1310 60 L1330 60 L1330 175 L1380 175 L1380 200 L1440 200 L1440 240 Z"
            fill="var(--color-ink-deep)"
          />
          <path
            d="M0 150 L120 150 L180 95 L260 130 L340 60 L420 100 L500 45 L580 90 L660 55 L740 25 L820 70 L900 40 L980 85 L1060 50 L1140 20 L1220 65 L1300 35 L1380 60 L1440 30"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          {[
            [180, 95], [340, 60], [500, 45], [660, 55], [820, 70], [980, 85], [1140, 20], [1300, 35],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="var(--color-gold)" />
          ))}
        </svg>
      </section>

      {/* Stats bar */}
      <section className="border-b border-[color:var(--color-line)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[color:var(--color-line)]">
            {[
              { value: `${totalBrokers}+`, label: "Verified Brokers" },
              { value: "100%", label: "SEC Licensed" },
              { value: "10", label: "Free Lessons" },
              { value: "Free", label: "Always" },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-7 text-center">
                <div className="sw-figure text-2xl font-semibold text-[color:var(--color-ink)]">{stat.value}</div>
                <div className="text-sm text-[color:var(--color-ink-soft)] mt-1.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-semibold text-[color:var(--color-ink)]">How Stockwise Works</h2>
            <p className="mt-3 text-[color:var(--color-ink-soft)]">Three steps from curious to confident investor</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Learn the Basics",
                desc: "Work through our free 10-lesson roadmap built for complete beginners. No finance degree required.",
              },
              {
                step: "02",
                title: "Compare Brokers",
                desc: "Browse and compare SEC-licensed brokers side by side. Check fees, minimum deposits, features, and real user reviews.",
              },
              {
                step: "03",
                title: "Open Your Account",
                desc: "Click through to your chosen broker's official platform via our referral link and open your account directly.",
              },
            ].map((item) => (
              <div key={item.step} className="p-7 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-paper)] hover:shadow-[0_8px_24px_-8px_rgba(11,30,45,0.15)] hover:border-[color:var(--color-teal)]/40 transition-all">
                <div className="sw-figure text-sm font-semibold text-[color:var(--color-teal-deep)] mb-4">{item.step}</div>
                <h3 className="font-display font-semibold text-lg mb-2 text-[color:var(--color-ink)]">{item.title}</h3>
                <p className="text-[color:var(--color-ink-soft)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brokers */}
      {featuredBrokers.length > 0 && (
        <section className="py-20 bg-[color:var(--color-paper-dim)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-semibold text-[color:var(--color-ink)]">Featured Brokers</h2>
                <p className="mt-2 text-[color:var(--color-ink-soft)]">Verified and trusted by thousands of Nigerian investors</p>
              </div>
              <Link href="/brokers" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[color:var(--color-teal-deep)] hover:text-[color:var(--color-teal)] transition-colors">
                See all <span className="sw-figure">{totalBrokers}</span> brokers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredBrokers.map((broker) => (
                <Link key={broker.id} href={`/brokers/${broker.slug}`}
                  className="group bg-white rounded-2xl border border-[color:var(--color-line)] p-6 hover:shadow-[0_12px_32px_-12px_rgba(11,30,45,0.2)] hover:border-[color:var(--color-teal)] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-[color:var(--color-ink)]">{broker.name}</h3>
                      <span className={`inline-flex items-center mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                        broker.type === "DIGITAL"
                          ? "bg-[color:var(--color-teal-tint)] text-[color:var(--color-teal-deep)]"
                          : "bg-[color:var(--color-paper-dim)] text-[color:var(--color-ink-soft)]"
                      }`}>
                        {broker.type === "DIGITAL" ? "Digital" : "Traditional"}
                      </span>
                    </div>
                    {broker.secLicensed && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-[color:var(--color-gold-tint)] text-[color:var(--color-gold-deep)]">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        SEC
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[color:var(--color-ink-soft)] line-clamp-2 mb-4">{broker.shortDescription}</p>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[color:var(--color-line)]">
                    <div>
                      <p className="text-xs text-[color:var(--color-ink-soft)]">Min. Deposit</p>
                      <p className="sw-figure text-sm font-semibold text-[color:var(--color-ink)]">{formatNaira(broker.minimumDeposit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[color:var(--color-ink-soft)]">Trust Score</p>
                      <p className="sw-figure text-sm font-semibold text-[color:var(--color-teal-deep)]">{broker.trustScore}/100</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Learn section */}
      {lessons.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[color:var(--color-teal-deep)]">Free Education</span>
                <h2 className="mt-2 font-display text-3xl font-semibold text-[color:var(--color-ink)]">
                  Learn to invest<br />before you invest
                </h2>
                <p className="mt-4 text-[color:var(--color-ink-soft)] leading-relaxed">
                  Our 10-lesson roadmap takes you from complete beginner to confident investor. Written in plain English with Nigerian examples you actually relate to.
                </p>
                <Link href="/learn"
                  className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl font-semibold text-white transition-colors bg-[color:var(--color-teal)] hover:bg-[color:var(--color-teal-deep)]">
                  Start Learning Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <Link key={lesson.id} href={`/learn/${lesson.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[color:var(--color-line)] hover:border-[color:var(--color-teal)] hover:shadow-sm transition-all group">
                    <div className="sw-figure w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 bg-[color:var(--color-teal-tint)] text-[color:var(--color-teal-deep)]">
                      {lesson.lessonNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[color:var(--color-ink)] text-sm">{lesson.title}</p>
                      <p className="text-xs text-[color:var(--color-ink-soft)] mt-0.5">{lesson.readingTime} min read</p>
                    </div>
                    <svg className="w-4 h-4 text-[color:var(--color-line)] group-hover:text-[color:var(--color-teal)] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, var(--color-teal), var(--color-teal-deep))" }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-semibold text-white">Ready to start investing?</h2>
          <p className="mt-4 text-white/80 text-lg">
            Join thousands of Nigerians already investing smarter with Stockwise.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold bg-white transition-colors hover:bg-[color:var(--color-paper-dim)] text-[color:var(--color-teal-deep)]">
              Create Free Account
            </Link>
            <Link href="/brokers"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold border-2 border-white text-white hover:bg-white hover:text-[color:var(--color-teal-deep)] transition-colors">
              Browse Brokers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
