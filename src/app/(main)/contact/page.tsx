// src/app/(main)/contact/page.tsx
import { Metadata } from "next";
export const metadata: Metadata = { title: "Contact Us - Stockwise" };

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold sw-text-ink">Contact Us</h1>
          <p className="mt-3 text-gray-500">Have a question or want to list your brokerage? We would love to hear from you.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            { title: "General Inquiries", email: "hello@stockwise.ng", desc: "Questions about the platform, brokers, or your account" },
            { title: "Broker Partnerships", email: "partners@stockwise.ng", desc: "List your brokerage or discuss affiliate arrangements" },
            { title: "Privacy and Data", email: "privacy@stockwise.ng", desc: "Data requests, NDPR inquiries, or privacy concerns" },
            { title: "Report a Scam", email: "report@stockwise.ng", desc: "Alert us about suspicious investment platforms" },
          ].map((item) => (
            <div key={item.title} className="p-5 rounded-2xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
              <a href={`mailto:${item.email}`} className="text-sm font-medium sw-text-brand">
                {item.email}
              </a>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-600">
            We are a small team and aim to respond to all inquiries within 24-48 hours on business days.
          </p>
        </div>
      </div>
    </main>
  );
}
