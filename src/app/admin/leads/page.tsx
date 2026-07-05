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

  // Clicks in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = await prisma.brokerClick.count({ where: { createdAt: { gte: sevenDaysAgo } } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sw-text-ink">Leads & Referral Clicks</h1>
        <p className="text-gray-500 text-sm mt-1">Track every time a user clicks through to a broker</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Clicks", value: totalClicks },
          { label: "Last 7 Days", value: recentCount },
          { label: "Brokers Tracked", value: brokerStats.length },
          { label: "Top Broker", value: brokerStats[0]?.name ?? "N/A" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold sw-text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Clicks per broker */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Clicks by Broker</h2>
          <div className="space-y-3">
            {brokerStats.map((broker, i) => {
              const pct = totalClicks > 0 ? (broker._count.clicks / totalClicks) * 100 : 0;
              return (
                <div key={broker.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{broker.name}</span>
                    <span className="text-sm font-bold sw-text-brand">{broker._count.clicks}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-teal)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue note */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Revenue Setup Guide</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="p-3 rounded-xl bg-[color:var(--color-teal-tint)]">
              <p className="font-semibold text-green-800 mb-1">Bamboo & Trove</p>
              <p className="text-xs text-green-700">Get your unique referral link from their mobile app under Profile. Update the referralLink field in the broker seed data or database directly.</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "var(--color-indigo-tint)" }}>
              <p className="font-semibold text-indigo-800 mb-1">Chaka Enterprise</p>
              <p className="text-xs text-indigo-700">Contact Chaka's business team at chaka.ng for their enterprise partnership API and custom referral link.</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "var(--color-warning-tint)" }}>
              <p className="font-semibold text-amber-800 mb-1">Traditional Brokers</p>
              <p className="text-xs text-amber-700">Contact Meristem, ARM, Stanbic etc. business development teams directly to negotiate formal affiliate agreements.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent clicks table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Clicks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Broker</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Source</th>
              </tr>
            </thead>
            <tbody>
              {recentClicks.map((click) => (
                <tr key={click.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{click.broker.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {click.userId ? "Logged in user" : "Guest"}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{formatDate(click.createdAt)}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 max-w-xs truncate">{click.referrer ?? "Direct"}</td>
                </tr>
              ))}
              {recentClicks.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-400">No clicks recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
