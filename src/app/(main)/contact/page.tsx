// src/app/(main)/contact/page.tsx
import { Metadata } from "next";
export const metadata: Metadata = { title: "Contact Us - Stockwise" };

export default function ContactPage() {
  const channels = [
    { title: "General Inquiries", email: "hello@stockwise.ng", desc: "Questions about the platform, brokers, or your account" },
    { title: "Broker Partnerships", email: "partners@stockwise.ng", desc: "List your brokerage or discuss affiliate arrangements" },
    { title: "Privacy and Data", email: "privacy@stockwise.ng", desc: "Data requests, NDPR inquiries, or privacy concerns" },
    { title: "Report a Scam", email: "report@stockwise.ng", desc: "Alert us about suspicious investment platforms" },
  ];

  return (
    <main className="sw-page-white">
      <div className="static-page-body">
        <div className="static-page-hero-inner">
          <h1 className="brokers-title text-center">Contact Us</h1>
          <p className="brokers-sub text-center">Have a question or want to list your brokerage? We would love to hear from you.</p>
        </div>

        <div className="contact-grid">
          {channels.map((item) => (
            <div key={item.title} className="contact-card">
              <h3 className="contact-card-title">{item.title}</h3>
              <p className="contact-card-desc">{item.desc}</p>
              <a href={`mailto:${item.email}`} className="contact-email">{item.email}</a>
            </div>
          ))}
        </div>

        <div className="contact-footer">
          We are a small team and aim to respond to all inquiries within 24-48 hours on business days.
        </div>
      </div>
    </main>
  );
}
