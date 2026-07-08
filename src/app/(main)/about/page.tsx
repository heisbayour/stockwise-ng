// src/app/(main)/about/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Stockwise - Nigeria's Broker Discovery Platform",
  description: "Stockwise connects Nigerian investors to SEC-licensed stock brokers. We make investing accessible, transparent, and trustworthy.",
};

export default function AboutPage() {
  const values = [
    { title: "SEC Licensed Only", desc: "Every broker on our platform is verified with the Securities and Exchange Commission of Nigeria." },
    { title: "Real Reviews", desc: "Reviews come from verified users who have actually interacted with these brokers." },
    { title: "Free Education", desc: "Our 10-lesson roadmap is completely free, with no hidden costs or upsells." },
    { title: "Transparent Fees", desc: "We display all fees, minimum deposits, and requirements clearly - no surprises." },
  ];

  return (
    <main className="sw-page-white">
      <div className="static-page-hero">
        <div className="static-page-hero-inner">
          <h1 className="static-page-title">About Stockwise</h1>
          <p className="static-page-sub">Closing the gap between Nigerians and the stock market</p>
        </div>
      </div>

      <div className="static-page-body">
        <section className="static-section">
          <h2 className="static-section-title">What We Do</h2>
          <p className="static-section-body">
            Stockwise is a broker discovery and investor education platform. We help Nigerians find, compare, and connect with SEC-licensed stockbrokers - then guide them through the basics of investing so they can start with confidence.
          </p>
          <p className="static-section-body">
            We are not a stockbroker. We do not execute trades, hold your money, or manage investments. When you are ready to invest, we connect you directly to your chosen broker&apos;s official platform.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">Why We Built This</h2>
          <p className="static-section-body">
            Nigeria has a young, ambitious population and a stock market that remains underexplored by everyday people. Too many Nigerians want to invest but do not know where to start, who to trust, or how the process works.
          </p>
          <p className="static-section-body">
            We built Stockwise to fix that. With the right information and trustworthy guidance, more Nigerians can build long-term wealth through investing.
          </p>
        </section>

        <div className="about-values-grid">
          {values.map((item) => (
            <div key={item.title} className="about-value-card">
              <h3 className="about-value-title">{item.title}</h3>
              <p className="about-value-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
