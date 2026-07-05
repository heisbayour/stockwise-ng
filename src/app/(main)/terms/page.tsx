// src/app/(main)/terms/page.tsx
import { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service - Stockwise" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold mb-2 sw-text-ink">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: July 2025</p>

        <div className="space-y-8 text-gray-600">
          {[
            { title: "1. About Stockwise", body: "Stockwise is an educational and broker-discovery platform. We are not a licensed stockbroker, investment advisor, or financial institution. We do not execute trades, hold funds, or manage investments on your behalf." },
            { title: "2. Broker Connections", body: "When you choose to open an account with a broker listed on Stockwise, you are redirected to that broker's official website via our referral link. Any agreement you enter is between you and that broker. Stockwise is not a party to that agreement and is not responsible for the broker's services, fees, or conduct." },
            { title: "3. Educational Content", body: "All articles, lessons, and guides on Stockwise are for general educational purposes only. Nothing on this platform constitutes financial, investment, or legal advice. You should conduct your own research and consult a licensed professional before making investment decisions." },
            { title: "4. User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information when registering and to notify us immediately of any unauthorized use of your account. We reserve the right to suspend accounts that violate these terms." },
            { title: "5. Reviews and Content", body: "Reviews must reflect genuine personal experiences. Stockwise reserves the right to remove reviews that are fraudulent, abusive, paid-for, or otherwise violate these terms. We approve reviews before publication." },
            { title: "6. Referral Links", body: "Stockwise uses referral links when redirecting users to brokers. We may earn a commission when users open and fund accounts through these links at no additional cost to you. This does not influence our broker listings or recommendations." },
            { title: "7. Limitation of Liability", body: "Stockwise provides information 'as is' without warranties of any kind. We are not liable for investment losses, broker disputes, or decisions made based on information found on this platform." },
            { title: "8. Changes to These Terms", body: "We may update these Terms from time to time. Continued use of Stockwise after changes are posted constitutes acceptance of the updated Terms." },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold mb-2 sw-text-ink">{section.title}</h2>
              <p className="leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
