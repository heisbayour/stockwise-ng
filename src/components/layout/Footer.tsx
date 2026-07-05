// src/components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-logo">
              <div className="nav-logo-icon">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="footer-brand-text">Stockwise</span>
            </div>
            <p className="footer-brand-desc">
              Connecting Nigerian investors to SEC-licensed brokers. We make investing accessible, transparent, and trustworthy.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Platform</h4>
            {[
              { label: "Find Brokers", href: "/brokers" },
              { label: "Learn Investing", href: "/learn" },
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 className="footer-col-title">Brokers</h4>
            {[
              { label: "Bamboo", href: "/brokers/bamboo" },
              { label: "Chaka", href: "/brokers/chaka" },
              { label: "Trove Finance", href: "/brokers/trove-finance" },
              { label: "Meristem", href: "/brokers/meristem-securities" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 className="footer-col-title">Legal</h4>
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">&copy; {new Date().getFullYear()} Stockwise. All rights reserved.</p>
          <p className="footer-disclaimer">
            Stockwise is not a licensed broker-dealer. We connect users to SEC-licensed brokers and do not execute trades or hold investments.
          </p>
        </div>
      </div>
    </footer>
  );
}
