// src/app/(main)/learn/page.tsx
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Stock Market Education for Nigerians - 10 Lessons",
  description: "Learn how to invest in Nigerian stocks with our free 10-lesson roadmap. From understanding the NGX to choosing your first broker, we cover everything.",
};

export default async function LearnPage() {
  const session = await getServerSession(authOptions);
  const lessons = await prisma.article.findMany({
    where: { isPublished: true, category: "LESSON" },
    orderBy: { lessonNumber: "asc" },
  });

  let completedIds = new Set<string>();
  if (session?.user?.id) {
    const progress = await prisma.learningProgress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { articleId: true },
    });
    completedIds = new Set(progress.map((p) => p.articleId));
  }

  const completed = lessons.filter((l) => completedIds.has(l.id)).length;
  const pct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D2137 100%)" }} className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest sw-text-brand">Free Education</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Your Investing Roadmap
          </h1>
          <p className="mt-4 text-gray-300 leading-relaxed">
            10 lessons. Zero jargon. Built for Nigerians starting from scratch. Learn how the stock market works, how to pick a broker, and how to make your first investment.
          </p>
          {session && lessons.length > 0 && (
            <div className="mt-8 bg-white/10 rounded-2xl p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Your Progress</span>
                <span className="text-sm font-semibold sw-text-brand">{completed}/{lessons.length} lessons</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--color-teal)" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lessons */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {lessons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Lessons are coming soon. Check back shortly!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const isDone = completedIds.has(lesson.id);
              return (
                <Link key={lesson.id} href={`/learn/${lesson.slug}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-sm"
                  style={{ borderColor: isDone ? "var(--color-teal)" : "var(--color-line)", background: isDone ? "var(--color-teal-tint)" : "white" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-colors"
                    style={{ background: isDone ? "var(--color-teal)" : "var(--color-paper-dim)", color: isDone ? "white" : "var(--color-ink-soft)" }}>
                    {isDone ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : lesson.lessonNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-[color:var(--color-teal)] transition-colors">{lesson.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{lesson.excerpt}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-xs text-gray-400 hidden sm:block">{lesson.readingTime} min</span>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-[color:var(--color-teal)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!session && (
          <div className="mt-8 p-6 rounded-2xl text-center bg-[color:var(--color-teal-tint)]">
            <p className="text-gray-700 font-medium mb-3">Sign in to track your progress across all lessons</p>
            <Link href="/register" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-white text-sm sw-btn-primary">
              Create Free Account
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
