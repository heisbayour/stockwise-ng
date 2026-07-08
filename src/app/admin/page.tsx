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

  const topBrokers = await prisma.broker.findMany({
    include: { _count: { select: { clicks: true, reviews: true } } },
    orderBy: { clicks: { _count: "desc" } },
    take: 5,
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true, emailVerified: true },
  });

  const stats = [
    { label: "Total Users", value: users, href: "/admin/users", cls: "indigo", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Total Brokers", value: brokers, href: "/admin/brokers", cls: "teal", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Total Clicks", value: clicks, href: "/admin/leads", cls: "warning", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Articles", value: articles, href: "/admin/articles", cls: "purple", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  return (
    <div>
      <div>
        <h1 className="admin-page-title">Admin Dashboard</h1>
        <p className="admin-page-sub">Overview of Stockwise platform activity</p>
      </div>

      {(pendingReviews > 0 || ninPending > 0) && (
        <div>
          {pendingReviews > 0 && (
            <div className="admin-alert admin-alert-warning">
              <div className="admin-alert-text">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                {pendingReviews} broker review{pendingReviews !== 1 ? "s" : ""} awaiting approval
              </div>
              <Link href="/admin/brokers" className="admin-alert-link">Review now</Link>
            </div>
          )}
          {ninPending > 0 && (
            <div className="admin-alert admin-alert-info">
              <div className="admin-alert-text">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                {ninPending} user NIN verification{ninPending !== 1 ? "s" : ""} pending review
              </div>
              <Link href="/admin/users?nin=pending" className="admin-alert-link">Review now</Link>
            </div>
          )}
        </div>
      )}

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-stat-card">
            <div className="admin-stat-row">
              <p className="admin-stat-label">{stat.label}</p>
              <div className={`admin-stat-icon admin-stat-icon-${stat.cls}`}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="admin-stat-val font-mono">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Top Brokers by Clicks</h2>
          </div>
          <div className="admin-card-body">
            {topBrokers.map((broker, i) => (
              <div key={broker.id} className="admin-bar-row">
                <span className={`admin-bar-rank ${i === 0 ? "admin-bar-rank-1" : ""}`}>{i + 1}</span>
                <span className="admin-bar-name">{broker.name}</span>
                <span className="admin-bar-val font-mono">{broker._count.clicks} clicks</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Users</h2>
            <Link href="/admin/users" className="admin-card-link">View all</Link>
          </div>
          <div className="admin-card-body">
            {recentUsers.map((user) => (
              <div key={user.id} className="admin-user-row">
                <div className="admin-user-avatar">{user.firstName?.[0] ?? user.email[0].toUpperCase()}</div>
                <div className="admin-user-info">
                  <p className="admin-user-name truncate">{user.firstName ? `${user.firstName} ${user.lastName}` : user.email}</p>
                  <p className="admin-user-email truncate">{user.email}</p>
                </div>
                <span className={`badge ${user.emailVerified ? "badge-teal" : "badge-warning"}`}>
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
