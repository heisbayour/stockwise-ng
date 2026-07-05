// src/components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[color:var(--color-ink)] text-[color:var(--color-on-ink)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[color:var(--color-teal)]">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="font-display font-semibold text-white text-lg">Stockwise</span>
            </div>
            <p className="text-sm text-[color:var(--color-on-ink-muted)] leading-relaxed">
              Connecting Nigerian investors to SEC-licensed brokers. We make investing accessible, transparent, and trustworthy.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Find Brokers", href: "/brokers" },
                { label: "Learn Investing", href: "/learn" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[color:var(--color-on-ink-muted)] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Brokers</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Bamboo", href: "/brokers/bamboo" },
                { label: "Chaka", href: "/brokers/chaka" },
                { label: "Trove Finance", href: "/brokers/trove-finance" },
                { label: "Meristem", href: "/brokers/meristem-securities" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[color:var(--color-on-ink-muted)] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[color:var(--color-on-ink-muted)] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[color:var(--color-on-ink-faint)]">
            &copy; {new Date().getFullYear()} Stockwise. All rights reserved.
          </p>
          <p className="text-xs text-[color:var(--color-on-ink-faint)] max-w-md text-center sm:text-right">
            Stockwise is not a licensed broker-dealer. We connect users to SEC-licensed brokers and do not execute trades or hold investments.
          </p>
        </div>
      </div>
    </footer>
  );
}
