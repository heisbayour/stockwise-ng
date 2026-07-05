"use client";
// src/components/layout/Navbar.tsx
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";

  const navLinks = [
    { label: "Find Brokers", href: "/brokers" },
    { label: "Learn", href: "/learn" },
    { label: "About", href: "/about" },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);
  const isAdmin = ["ADMIN", "SUPERUSER"].includes(session?.user?.role ?? "");

  return (
    <header className="nav-root">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <span className="nav-logo-text">Stockwise</span>
        </Link>

        <nav className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "nav-link nav-link-active" : "nav-link"}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {isLoading ? (
            <div className="nav-skeleton" />
          ) : isLoggedIn ? (
            <div className="nav-dropdown-wrapper">
              <button className="nav-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="nav-avatar">{session.user.name?.[0]?.toUpperCase() ?? "U"}</div>
                <span className="nav-avatar-name">{session.user.name?.split(" ")[0]}</span>
                <svg className="nav-avatar-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="nav-dropdown">
                  <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="nav-dropdown-item">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)} className="nav-dropdown-item">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="nav-dropdown-item">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  <div className="nav-dropdown-divider" />
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="nav-dropdown-item nav-dropdown-item-danger"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="nav-signin">Sign In</Link>
              <Link href="/register" className="nav-cta">Get Started Free</Link>
            </>
          )}
        </div>

        <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="nav-mobile">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={isActive(link.href) ? "nav-mobile-link nav-mobile-link-active" : "nav-mobile-link"}>
              {link.label}
            </Link>
          ))}
          <div className="nav-mobile-actions">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="nav-mobile-link">Dashboard</Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="nav-mobile-link">Admin Panel</Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="nav-dropdown-item nav-dropdown-item-danger">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="nav-mobile-signin">Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="nav-mobile-cta">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
