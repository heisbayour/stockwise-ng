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
    <main className="sw-page-white">
      <div className="learn-page-hero">
        <div className="learn-page-hero-inner">
          <span className="learn-page-eyebrow">Free Education</span>
          <h1 className="learn-page-title">Your Investing Roadmap</h1>
          <p className="learn-page-desc">
            10 lessons. Zero jargon. Built for Nigerians starting from scratch. Learn how the stock market works, how to pick a broker, and how to make your first investment.
          </p>
          {session && lessons.length > 0 && (
            <div className="learn-progress-bar-wrap">
              <div className="learn-progress-row">
                <span className="learn-progress-label">Your Progress</span>
                <span className="learn-progress-count font-mono">{completed}/{lessons.length} lessons</span>
              </div>
              <div className="learn-progress-track">
                {/* Width is per-user numeric progress data; can't be a static class. */}
                <div className="learn-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="learn-body">
        {lessons.length === 0 ? (
          <div className="dash-empty">
            <p>Lessons are coming soon. Check back shortly!</p>
          </div>
        ) : (
          <div>
            {lessons.map((lesson) => {
              const isDone = completedIds.has(lesson.id);
              return (
                <Link key={lesson.id} href={`/learn/${lesson.slug}`} className={`lesson-row ${isDone ? "lesson-row-done" : ""}`}>
                  <div className={`lesson-num ${isDone ? "lesson-num-done" : ""} font-mono`}>
                    {isDone ? (
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : lesson.lessonNumber}
                  </div>
                  <div className="lesson-info">
                    <p className="lesson-title">{lesson.title}</p>
                    <p className="lesson-excerpt">{lesson.excerpt}</p>
                  </div>
                  <span className="lesson-meta font-mono">{lesson.readingTime} min</span>
                  <svg className="lesson-arrow" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}

        {!session && (
          <div className="learn-cta-box">
            <p className="learn-cta-box-text">Sign in to track your progress across all lessons</p>
            <Link href="/register" className="btn btn-primary">Create Free Account</Link>
          </div>
        )}
      </div>
    </main>
  );
}
