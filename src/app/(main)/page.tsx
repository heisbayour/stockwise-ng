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
    <main className="sw-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              <span className="font-mono">{totalBrokers}</span> SEC-Licensed Brokers Listed
            </div>

            <h1 className="hero-h1">
              Invest in Nigeria&apos;s future. <span className="hero-h1-accent">The right way.</span>
            </h1>

            <p className="hero-p">
              Stockwise connects you to verified, SEC-licensed Nigerian stock brokers. Compare fees, read real reviews, learn how investing works, and start your journey with confidence.
            </p>

            <div className="hero-actions">
              <Link href="/brokers" className="hero-btn-primary">
                Find a Broker
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/learn" className="hero-btn-secondary">Learn Investing Free</Link>
            </div>

            <div className="hero-trust">
              {["SEC-Licensed Brokers Only", "Real User Reviews", "100% Free to Use"].map((text) => (
                <span key={text} className="hero-trust-item">
                  <svg className="hero-trust-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Signature: Lagos skyline silhouette with a rising ticker line --
            its own block below the text, not layered on top of it. */}
        <div className="hero-svg-wrapper">
          <svg className="hero-svg" viewBox="0 0 1440 240" preserveAspectRatio="none" aria-hidden="true">
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
            {[[180, 95], [340, 60], [500, 45], [660, 55], [820, 70], [980, 85], [1140, 20], [1300, 35]].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="var(--color-gold)" />
            ))}
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="stats-bar">
        <div className="stats-inner">
          {[
            { value: `${totalBrokers}+`, label: "Verified Brokers" },
            { value: "100%", label: "SEC Licensed" },
            { value: "10", label: "Free Lessons" },
            { value: "Free", label: "Always" },
          ].map((stat) => (
            <div key={stat.label} className="stats-item">
              <div className="stats-value">{stat.value}</div>
              <div className="stats-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="sw-container">
          <div className="how-header">
            <h2 className="how-title">How Stockwise Works</h2>
            <p className="how-sub">Three steps from curious to confident investor</p>
          </div>

          <div className="how-grid">
            {[
              { step: "01", title: "Learn the Basics", desc: "Work through our free 10-lesson roadmap built for complete beginners. No finance degree required." },
              { step: "02", title: "Compare Brokers", desc: "Browse and compare SEC-licensed brokers side by side. Check fees, minimum deposits, features, and real user reviews." },
              { step: "03", title: "Open Your Account", desc: "Click through to your chosen broker's official platform via our referral link and open your account directly." },
            ].map((item) => (
              <div key={item.step} className="how-card">
                <div className="how-step">{item.step}</div>
                <h3 className="how-card-title">{item.title}</h3>
                <p className="how-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brokers */}
      {featuredBrokers.length > 0 && (
        <section className="featured-section">
          <div className="sw-container">
            <div className="featured-header">
              <div>
                <h2 className="featured-title">Featured Brokers</h2>
                <p className="featured-sub">Verified and trusted by thousands of Nigerian investors</p>
              </div>
              <Link href="/brokers" className="featured-link">
                See all {totalBrokers} brokers
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="featured-grid">
              {featuredBrokers.map((broker) => (
                <Link key={broker.id} href={`/brokers/${broker.slug}`} className="broker-card-home">
                  <div className="broker-card-home-top">
                    <div>
                      <h3 className="broker-card-home-name">{broker.name}</h3>
                      <span className={`badge ${broker.type === "DIGITAL" ? "badge-indigo" : "badge-slate"}`}>
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

                  <p className="broker-card-home-desc">{broker.shortDescription}</p>

                  <div className="broker-card-home-stats">
                    <div>
                      <p className="broker-card-stat-label">Min. Deposit</p>
                      <p className="broker-card-stat-value font-mono">{formatNaira(broker.minimumDeposit)}</p>
                    </div>
                    <div>
                      <p className="broker-card-stat-label">Trust Score</p>
                      <p className="broker-card-stat-value broker-card-stat-teal font-mono">{broker.trustScore}/100</p>
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
        <section className="learn-section">
          <div className="sw-container">
            <div className="learn-grid">
              <div>
                <span className="learn-eyebrow">Free Education</span>
                <h2 className="learn-title">Learn to invest<br />before you invest</h2>
                <p className="learn-desc">
                  Our 10-lesson roadmap takes you from complete beginner to confident investor. Written in plain English with Nigerian examples you actually relate to.
                </p>
                <Link href="/learn" className="hero-btn-primary">
                  Start Learning Free
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="lesson-preview-list">
                {lessons.map((lesson) => (
                  <Link key={lesson.id} href={`/learn/${lesson.slug}`} className="lesson-preview-item">
                    <div className="lesson-preview-num font-mono">{lesson.lessonNumber}</div>
                    <div className="lesson-preview-info">
                      <p className="lesson-preview-title">{lesson.title}</p>
                      <p className="lesson-preview-meta">{lesson.readingTime} min read</p>
                    </div>
                    <svg className="lesson-preview-arrow" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to start investing?</h2>
          <p className="cta-desc">Join thousands of Nigerians already investing smarter with Stockwise.</p>
          <div className="cta-actions">
            <Link href="/register" className="cta-btn-white">Create Free Account</Link>
            <Link href="/brokers" className="cta-btn-border">Browse Brokers</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
