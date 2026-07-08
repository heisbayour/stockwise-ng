// src/app/admin/brokers/page.tsx
import { prisma } from "@/lib/prisma";
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
      <h1 className="admin-page-title">Brokers</h1>
      <p className="admin-page-sub">{brokers.length} brokers listed</p>

      <div className="admin-card">
        <table className="admin-table">
          <thead className="admin-table-head">
            <tr>
              <th>Broker</th>
              <th>Type</th>
              <th>Min. Deposit</th>
              <th>Clicks</th>
              <th>Reviews</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brokers.map((broker) => (
              <tr key={broker.id} className="admin-table-row">
                <td>
                  <p className="admin-user-name">{broker.name}</p>
                  <p className="admin-user-email">Trust: {broker.trustScore}/100</p>
                </td>
                <td>
                  <span className={`badge ${broker.type === "DIGITAL" ? "badge-indigo" : "badge-slate"}`}>
                    {broker.type}
                  </span>
                </td>
                <td className="font-mono">{formatNaira(broker.minimumDeposit)}</td>
                <td><span className="font-mono admin-clicks-val">{broker._count.clicks}</span></td>
                <td>
                  <div className="admin-action-row">
                    <span className="font-mono">{broker._count.reviews}</span>
                    {broker.reviews.length > 0 && (
                      <span className="badge badge-warning">{broker.reviews.length} pending</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="admin-action-row">
                    {broker.secLicensed && <span className="badge badge-teal">SEC</span>}
                    {broker.isFeatured && <span className="badge badge-indigo">Featured</span>}
                    {!broker.isActive && <span className="badge badge-danger">Hidden</span>}
                  </div>
                </td>
                <td>
                  <AdminBrokerActions broker={{ id: broker.id, isActive: broker.isActive, isFeatured: broker.isFeatured, pendingReviews: broker.reviews.length }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
