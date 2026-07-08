// src/app/(main)/layout.tsx
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sw-page-white flex">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
