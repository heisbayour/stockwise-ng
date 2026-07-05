// src/app/admin/brokers/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatNaira } from "@/lib/formatters";
import AdminBrokerActions from "@/components/admin/AdminBrokerActions";

export default async function AdminBrokersPage() {
  const brokers = await prisma.broker.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { clicks: true, reviews: true } },
      reviews: { where: { isApproved: false }, select: { id: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold sw-text-ink">Brokers</h1>
          <p className="text-gray-500 text-sm mt-1">{brokers.length} brokers listed</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Broker</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min. Deposit</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviews</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((broker) => (
                <tr key={broker.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{broker.name}</p>
                      <p className="text-xs text-gray-400">Trust: {broker.trustScore}/100</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                      background: broker.type === "DIGITAL" ? "var(--color-indigo-tint)" : "var(--color-paper-dim)",
                      color: broker.type === "DIGITAL" ? "var(--color-indigo)" : "var(--color-ink-soft)",
                    }}>
                      {broker.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{formatNaira(broker.minimumDeposit)}</td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold sw-text-brand">{broker._count.clicks}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-700">{broker._count.reviews}</span>
                      {broker.reviews.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium sw-badge-warning">
                          {broker.reviews.length} pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {broker.secLicensed && <span className="text-xs px-1.5 py-0.5 rounded-full font-medium sw-badge-teal">SEC</span>}
                      {broker.isFeatured && <span className="text-xs px-1.5 py-0.5 rounded-full font-medium sw-badge-indigo">Featured</span>}
                      {!broker.isActive && <span className="text-xs px-1.5 py-0.5 rounded-full font-medium sw-badge-danger">Hidden</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <AdminBrokerActions broker={{ id: broker.id, isActive: broker.isActive, isFeatured: broker.isFeatured, pendingReviews: broker.reviews.length }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
