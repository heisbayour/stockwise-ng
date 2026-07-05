// src/app/(main)/about/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Stockwise - Nigeria's Broker Discovery Platform",
  description: "Stockwise connects Nigerian investors to SEC-licensed stock brokers. We make investing accessible, transparent, and trustworthy.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div style={{ background: "linear-gradient(135deg, #0A1628, #0D2137)" }} className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold text-white">About Stockwise</h1>
          <p className="mt-4 text-gray-300 text-lg">Closing the gap between Nigerians and the stock market</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4 sw-text-ink">What We Do</h2>
          <p className="text-gray-600 leading-relaxed">
            Stockwise is a broker discovery and investor education platform. We help Nigerians find, compare, and connect with SEC-licensed stockbrokers - then guide them through the basics of investing so they can start with confidence.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            We are not a stockbroker. We do not execute trades, hold your money, or manage investments. When you are ready to invest, we connect you directly to your chosen broker's official platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 sw-text-ink">Why We Built This</h2>
          <p className="text-gray-600 leading-relaxed">
            Nigeria has a young, ambitious population and a stock market that remains underexplored by everyday people. Too many Nigerians want to invest but don't know where to start, who to trust, or how the process works.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            We built Stockwise to fix that. With the right information and trustworthy guidance, more Nigerians can build long-term wealth through investing.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: "shield", title: "SEC Licensed Only", desc: "Every broker on our platform is verified with the Securities and Exchange Commission of Nigeria." },
            { icon: "star", title: "Real Reviews", desc: "Reviews come from verified users who have actually interacted with these brokers." },
            { icon: "book", title: "Free Education", desc: "Our 10-lesson roadmap is completely free, with no hidden costs or upsells." },
            { icon: "chart", title: "Transparent Fees", desc: "We display all fees, minimum deposits, and requirements clearly - no surprises." },
          ].map((item) => (
            <div key={item.title} className="p-5 rounded-2xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
