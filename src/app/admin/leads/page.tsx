// src/app/admin/leads/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/formatters";

export default async function AdminLeadsPage() {
  const [totalClicks, brokerStats, recentClicks] = await Promise.all([
    prisma.brokerClick.count(),
    prisma.broker.findMany({
      include: { _count: { select: { clicks: true } } },
      orderBy: { clicks: { _count: "desc" } },
    }),
    prisma.brokerClick.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { broker: { select: { name: true, slug: true } } },
    }),
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = await prisma.brokerClick.count({ where: { createdAt: { gte: sevenDaysAgo } } });

  const stats = [
    { label: "Total Clicks", value: totalClicks },
    { label: "Last 7 Days", value: recentCount },
    { label: "Brokers Tracked", value: brokerStats.length },
    { label: "Top Broker", value: brokerStats[0]?.name ?? "N/A" },
  ];

  return (
    <div>
      <h1 className="admin-page-title">Leads &amp; Referral Clicks</h1>
      <p className="admin-page-sub">Track every time a user clicks through to a broker</p>

      <div className="leads-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="leads-stat-card">
            <p className="leads-stat-label">{stat.label}</p>
            <p className="leads-stat-val font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="leads-info-card">
          <h2 className="admin-card-title">Clicks by Broker</h2>
          <div>
            {brokerStats.map((broker) => {
              const pct = totalClicks > 0 ? (broker._count.clicks / totalClicks) * 100 : 0;
              return (
                <div key={broker.id} className="leads-info-block">
                  <div className="admin-stat-row">
                    <span className="admin-user-name">{broker.name}</span>
                    <span className="leads-stat-val font-mono">{broker._count.clicks}</span>
                  </div>
                  <div className="leads-bar-track">
                    {/* Width is per-broker click-share data; can't be a static class. */}
                    <div className="leads-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="leads-info-card">
          <h2 className="admin-card-title">Revenue Setup Guide</h2>
          <div className="leads-info-block leads-info-teal">
            <p className="leads-info-title">Bamboo &amp; Trove</p>
            <p className="leads-info-desc">Get your unique referral link from their mobile app under Profile. Update the referralLink field in the broker seed data or database directly.</p>
          </div>
          <div className="leads-info-block leads-info-indigo">
            <p className="leads-info-title">Chaka Enterprise</p>
            <p className="leads-info-desc">Contact Chaka&apos;s business team at chaka.ng for their enterprise partnership API and custom referral link.</p>
          </div>
          <div className="leads-info-block leads-info-gold">
            <p className="leads-info-title">Traditional Brokers</p>
            <p className="leads-info-desc">Contact Meristem, ARM, Stanbic etc. business development teams directly to negotiate formal affiliate agreements.</p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Recent Clicks</h2>
        </div>
        <table className="admin-table">
          <thead className="admin-table-head">
            <tr>
              <th>Broker</th>
              <th>User</th>
              <th>Date</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {recentClicks.map((click) => (
              <tr key={click.id} className="admin-table-row">
                <td className="admin-user-name">{click.broker.name}</td>
                <td className="admin-user-email">{click.userId ? "Logged in user" : "Guest"}</td>
                <td className="admin-user-email">{formatDate(click.createdAt)}</td>
                <td className="admin-user-email truncate">{click.referrer ?? "Direct"}</td>
              </tr>
            ))}
            {recentClicks.length === 0 && (
              <tr><td colSpan={4} className="admin-empty">No clicks recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
