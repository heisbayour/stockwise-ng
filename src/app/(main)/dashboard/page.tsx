// src/app/(main)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatNaira } from "@/lib/formatters";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, savedBrokers, watchlist, totalLessons, completedLessons, recentActivity] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.savedBroker.findMany({
      where: { userId }, include: { broker: true }, take: 4, orderBy: { createdAt: "desc" },
    }),
    prisma.watchlist.findMany({ where: { userId }, take: 5, orderBy: { addedAt: "desc" } }),
    prisma.article.count({ where: { category: "LESSON", isPublished: true } }),
    prisma.learningProgress.count({ where: { userId, completed: true } }),
    prisma.learningProgress.findMany({
      where: { userId },
      include: { article: { select: { title: true, slug: true } } },
      orderBy: { lastRead: "desc" },
      take: 3,
    }),
  ]);

  const progressPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find next incomplete lesson
  const completedIds = (await prisma.learningProgress.findMany({
    where: { userId, completed: true }, select: { articleId: true },
  })).map((p) => p.articleId);

  const nextLesson = await prisma.article.findFirst({
    where: { isPublished: true, category: "LESSON", id: { notIn: completedIds } },
    orderBy: { lessonNumber: "asc" },
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sw-text-ink">
          Good day, {user?.firstName ?? "Investor"} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here is your investing dashboard</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Lessons Completed", value: `${completedLessons}/${totalLessons}`, href: "/learn", color: "var(--color-teal)" },
          { label: "Saved Brokers", value: savedBrokers.length, href: "/dashboard/saved-brokers", color: "var(--color-indigo)" },
          { label: "Watchlist Items", value: watchlist.length, href: "/dashboard/watchlist", color: "var(--color-warning)" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
            <p className="text-xs font-medium text-gray-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Learning progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Learning Progress</h2>
          <Link href="/learn" className="text-sm font-medium sw-text-brand">
            {nextLesson ? "Continue" : "View All"}
          </Link>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: "var(--color-teal)" }} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{completedLessons} of {totalLessons} lessons completed</span>
          <span className="font-semibold sw-text-brand">{progressPct}%</span>
        </div>
        {nextLesson && (
          <Link href={`/learn/${nextLesson.slug}`}
            className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-[color:var(--color-teal)] transition-colors group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold sw-badge-teal">
              {nextLesson.lessonNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Continue: {nextLesson.title}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-[color:var(--color-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Saved brokers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Saved Brokers</h2>
            <Link href="/dashboard/saved-brokers" className="text-sm font-medium sw-text-brand">View all</Link>
          </div>
          {savedBrokers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">No saved brokers yet</p>
              <Link href="/brokers" className="text-sm font-medium sw-text-brand">Browse brokers</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {savedBrokers.map((sb) => (
                <Link key={sb.id} href={`/brokers/${sb.broker.slug}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">{sb.broker.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: sb.broker.type === "DIGITAL" ? "var(--color-indigo-tint)" : "var(--color-paper-dim)",
                    color: sb.broker.type === "DIGITAL" ? "var(--color-indigo)" : "var(--color-ink-soft)",
                  }}>{sb.broker.type === "DIGITAL" ? "Digital" : "Traditional"}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Watchlist</h2>
            <Link href="/dashboard/watchlist" className="text-sm font-medium sw-text-brand">Manage</Link>
          </div>
          {watchlist.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">No stocks tracked yet</p>
              <Link href="/dashboard/watchlist" className="text-sm font-medium sw-text-brand">Add stocks</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                  <div>
                    <span className="text-sm font-bold text-gray-900">{item.ticker}</span>
                    <span className="text-xs text-gray-500 ml-2">{item.companyName}</span>
                  </div>
                  <span className="text-xs text-gray-400">NGX</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NIN verification notice */}
      {user?.ninSubmitted && !user?.ninVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">NIN Verification Pending</p>
            <p className="text-xs text-amber-700 mt-0.5">Your NIN is under review. This typically takes 24-48 hours.</p>
          </div>
        </div>
      )}
    </div>
  );
}
