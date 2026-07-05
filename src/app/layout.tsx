// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/layout/AuthProvider";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://stockwise.ng"),
  title: {
    default: "Stockwise - Find SEC-Licensed Nigerian Stock Brokers",
    template: "%s | Stockwise",
  },
  description: "Compare SEC-licensed Nigerian stock brokers, learn how to invest on the NGX, and start your investment journey with confidence. Free broker comparison platform.",
  keywords: ["Nigerian stock broker", "NGX broker", "SEC licensed broker Nigeria", "how to invest in Nigeria", "Nigerian stock exchange", "invest Nigeria", "stockbroker comparison"],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://stockwise.ng",
    siteName: "Stockwise",
    title: "Stockwise - Find SEC-Licensed Nigerian Stock Brokers",
    description: "Compare SEC-licensed Nigerian stock brokers, learn how to invest on the NGX, and start your investment journey with confidence.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Stockwise" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockwise - Nigerian Stock Broker Comparison",
    description: "Find and compare SEC-licensed Nigerian stock brokers. Start investing on the NGX today.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
