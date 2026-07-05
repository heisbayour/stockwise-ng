// src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [users, brokers, articles, clicks, pendingReviews, ninPending] = await Promise.all([
    prisma.user.count(),
    prisma.broker.count(),
    prisma.article.count(),
    prisma.brokerClick.count(),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.user.count({ where: { ninSubmitted: true, ninVerified: false } }),
  ]);

  // Clicks per broker for top brokers
  const topBrokers = await prisma.broker.findMany({
    include: { _count: { select: { clicks: true, reviews: true } } },
    orderBy: { clicks: { _count: "desc" } },
    take: 5,
  });

  // Recent users
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true, emailVerified: true },
  });

  const stats = [
    { label: "Total Users", value: users, href: "/admin/users", color: "var(--color-indigo)", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Total Brokers", value: brokers, href: "/admin/brokers", color: "var(--color-teal)", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Total Clicks", value: clicks, href: "/admin/leads", color: "var(--color-warning)", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Articles", value: articles, href: "/admin/articles", color: "var(--color-purple)", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold sw-text-ink">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Overview of Stockwise platform activity</p>
      </div>

      {/* Action required alerts */}
      {(pendingReviews > 0 || ninPending > 0) && (
        <div className="mb-6 space-y-2">
          {pendingReviews > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: "var(--color-warning-tint)", borderColor: "var(--color-warning-border)" }}>
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                {pendingReviews} broker review{pendingReviews !== 1 ? "s" : ""} awaiting approval
              </div>
              <Link href="/admin/brokers" className="text-xs font-semibold text-amber-700 hover:underline">Review now</Link>
            </div>
          )}
          {ninPending > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: "var(--color-info-tint)", borderColor: "var(--color-info-border)" }}>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                {ninPending} user NIN verification{ninPending !== 1 ? "s" : ""} pending review
              </div>
              <Link href="/admin/users?nin=pending" className="text-xs font-semibold text-blue-700 hover:underline">Review now</Link>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                <svg className="w-4 h-4" style={{ color: stat.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold sw-text-ink">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top brokers by clicks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Brokers by Clicks</h2>
          <div className="space-y-3">
            {topBrokers.map((broker, i) => (
              <div key={broker.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: i === 0 ? "var(--color-teal)" : "var(--color-paper-dim)", color: i === 0 ? "white" : "var(--color-ink-soft)" }}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-900">{broker.name}</span>
                <div className="text-right">
                  <span className="text-sm font-bold sw-text-brand">{broker._count.clicks}</span>
                  <span className="text-xs text-gray-400 ml-1">clicks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
            <Link href="/admin/users" className="text-xs font-medium sw-text-brand">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 sw-btn-primary">
                  {user.firstName?.[0] ?? user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" style={{
                  background: user.emailVerified ? "var(--color-teal-tint)" : "var(--color-warning-tint)",
                  color: user.emailVerified ? "var(--color-teal-deep)" : "var(--color-warning)",
                }}>
                  {user.emailVerified ? user.role : "Unverified"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
