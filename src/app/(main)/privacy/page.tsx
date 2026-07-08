// src/app/(main)/privacy/page.tsx
import { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy - Stockwise" };

export default function PrivacyPage() {
  const sections = [
    { title: "1. Information We Collect", body: "When you create a Stockwise account, we collect your name, email address, phone number, and optionally your National Identification Number (NIN). We also collect non-personal data such as browser type, pages visited, and time spent on the platform." },
    { title: "2. How We Use Your Information", body: "We use your information to manage your account, personalize your experience, track your learning progress, save your broker preferences, and send important account notifications. We do not sell your personal information to third parties under any circumstances." },
    { title: "3. Data Sharing with Brokers", body: "Stockwise does not automatically share your personal information with brokers. When you click 'Open Account' on a broker, you are redirected to their platform where you provide your own information under their privacy policy." },
    { title: "4. NIN and Identity Data", body: "Your NIN, where provided, is stored securely and used only for identity verification purposes. It is reviewed by our administrative team and is never shared with third parties. Verified NIN status cannot be edited once confirmed." },
    { title: "5. Data Security", body: "Passwords are hashed using bcrypt before storage - we never store readable passwords. All data is transmitted over HTTPS. Our database is hosted on secured infrastructure with regular backups." },
    { title: "6. NDPR Compliance", body: "Stockwise processes your personal data in accordance with Nigeria's Data Protection Regulation (NDPR). You have the right to access, correct, or delete your data at any time by contacting us or through your account settings." },
    { title: "7. Cookies", body: "We use session cookies for authentication purposes only. We do not use tracking cookies or third-party advertising cookies." },
    { title: "8. Contact Us", body: "For privacy inquiries, email us at privacy@stockwise.ng" },
  ];

  return (
    <main className="sw-page-white">
      <div className="static-page-body">
        <h1 className="brokers-title">Privacy Policy</h1>
        <p className="static-page-updated">Last updated: July 2025</p>

        <div>
          {sections.map((section) => (
            <section key={section.title} className="static-section">
              <h2 className="static-section-title">{section.title}</h2>
              <p className="static-section-body">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
