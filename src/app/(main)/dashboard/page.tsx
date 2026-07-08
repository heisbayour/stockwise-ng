// src/app/(main)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, savedBrokers, watchlist, totalLessons, completedLessons] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.savedBroker.findMany({
      where: { userId }, include: { broker: true }, take: 4, orderBy: { createdAt: "desc" },
    }),
    prisma.watchlist.findMany({ where: { userId }, take: 5, orderBy: { addedAt: "desc" } }),
    prisma.article.count({ where: { category: "LESSON", isPublished: true } }),
    prisma.learningProgress.count({ where: { userId, completed: true } }),
  ]);

  const progressPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const completedIds = (await prisma.learningProgress.findMany({
    where: { userId, completed: true }, select: { articleId: true },
  })).map((p) => p.articleId);

  const nextLesson = await prisma.article.findFirst({
    where: { isPublished: true, category: "LESSON", id: { notIn: completedIds } },
    orderBy: { lessonNumber: "asc" },
  });

  return (
    <div>
      <div className="dash-welcome">
        <h1 className="dash-welcome-name">Good day, {user?.firstName ?? "Investor"}</h1>
        <p className="dash-welcome-sub">Here is your investing dashboard</p>
      </div>

      <div className="dash-stats-row">
        {[
          { label: "Lessons Completed", value: `${completedLessons}/${totalLessons}`, href: "/learn", cls: "dash-stat-teal" },
          { label: "Saved Brokers", value: savedBrokers.length, href: "/dashboard/saved-brokers", cls: "dash-stat-indigo" },
          { label: "Watchlist Items", value: watchlist.length, href: "/dashboard/watchlist", cls: "dash-stat-warning" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="dash-stat-card">
            <p className="dash-stat-label">{stat.label}</p>
            <p className={`dash-stat-value font-mono ${stat.cls}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="dash-widget">
        <div className="dash-widget-header">
          <h2 className="dash-widget-title">Learning Progress</h2>
          <Link href="/learn" className="dash-widget-link">{nextLesson ? "Continue" : "View All"}</Link>
        </div>
        <div className="dash-progress-track">
          {/* Width is per-user numeric progress; can't be a static class. */}
          <div className="dash-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="dash-progress-labels">
          <span className="dash-progress-text">{completedLessons} of {totalLessons} lessons completed</span>
          <span className="dash-progress-pct font-mono">{progressPct}%</span>
        </div>
        {nextLesson && (
          <Link href={`/learn/${nextLesson.slug}`} className="dash-next-lesson">
            <div className="dash-next-num font-mono">{nextLesson.lessonNumber}</div>
            <div className="dash-next-info">
              <p className="dash-next-title">Continue: {nextLesson.title}</p>
            </div>
            <svg className="lesson-arrow" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      <div className="dash-grid-2">
        <div className="dash-widget">
          <div className="dash-widget-header">
            <h2 className="dash-widget-title">Saved Brokers</h2>
            <Link href="/dashboard/saved-brokers" className="dash-widget-link">View all</Link>
          </div>
          {savedBrokers.length === 0 ? (
            <div className="dash-empty">
              <p>No saved brokers yet</p>
              <Link href="/brokers" className="dash-empty-link">Browse brokers</Link>
            </div>
          ) : (
            <div>
              {savedBrokers.map((sb) => (
                <Link key={sb.id} href={`/brokers/${sb.broker.slug}`} className="dash-item-row">
                  <span className="dash-item-name">{sb.broker.name}</span>
                  <span className={`badge ${sb.broker.type === "DIGITAL" ? "badge-indigo" : "badge-slate"}`}>
                    {sb.broker.type === "DIGITAL" ? "Digital" : "Traditional"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="dash-widget">
          <div className="dash-widget-header">
            <h2 className="dash-widget-title">Watchlist</h2>
            <Link href="/dashboard/watchlist" className="dash-widget-link">Manage</Link>
          </div>
          {watchlist.length === 0 ? (
            <div className="dash-empty">
              <p>No stocks tracked yet</p>
              <Link href="/dashboard/watchlist" className="dash-empty-link">Add stocks</Link>
            </div>
          ) : (
            <div>
              {watchlist.map((item) => (
                <div key={item.id} className="dash-item-row">
                  <div>
                    <span className="dash-item-ticker">{item.ticker}</span>
                    <span className="dash-item-sub"> {item.companyName}</span>
                  </div>
                  <span className="dash-item-exchange">NGX</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {user?.ninSubmitted && !user?.ninVerified && (
        <div className="dash-nin-alert">
          <svg className="dash-nin-alert-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="dash-nin-alert-title">NIN Verification Pending</p>
            <p className="dash-nin-alert-sub">Your NIN is under review. This typically takes 24-48 hours.</p>
          </div>
        </div>
      )}
    </div>
  );
}
