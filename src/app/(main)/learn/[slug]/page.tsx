// src/app/(main)/learn/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MarkCompleteButton from "@/components/education/MarkCompleteButton";
import LessonContent from "@/components/education/LessonContent";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await prisma.article.findUnique({ where: { slug } });
  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: `${lesson.title} - Free Nigerian Investing Lesson`,
    description: lesson.excerpt,
  };
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const lesson = await prisma.article.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { firstName: true, lastName: true } } },
  });
  if (!lesson) notFound();

  let isCompleted = false;
  if (session?.user?.id) {
    const progress = await prisma.learningProgress.findUnique({
      where: { userId_articleId: { userId: session.user.id, articleId: lesson.id } },
    });
    isCompleted = progress?.completed ?? false;
  }

  const nextLesson = lesson.lessonNumber
    ? await prisma.article.findFirst({
        where: { lessonNumber: lesson.lessonNumber + 1, isPublished: true, category: "LESSON" },
        select: { slug: true, title: true, lessonNumber: true },
      })
    : null;

  const prevLesson = lesson.lessonNumber && lesson.lessonNumber > 1
    ? await prisma.article.findFirst({
        where: { lessonNumber: lesson.lessonNumber - 1, isPublished: true, category: "LESSON" },
        select: { slug: true, title: true, lessonNumber: true },
      })
    : null;

  return (
    <main className="lesson-page">
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link href="/learn" className="breadcrumb-link">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {" "}Back to Roadmap
          </Link>
        </div>
      </div>

      <article className="lesson-body-inner">
        <header className="lesson-header">
          {lesson.lessonNumber && (
            <span className="lesson-eyebrow">Lesson {lesson.lessonNumber} of 10</span>
          )}
          <h1 className="lesson-h1">{lesson.title}</h1>
          <div className="lesson-meta-row">
            <span>{lesson.readingTime} min read</span>
            <span className="lesson-meta-sep" />
            <span>By {lesson.author ? `${lesson.author.firstName} ${lesson.author.lastName}` : lesson.authorName}</span>
            {isCompleted && (
              <>
                <span className="lesson-meta-sep" />
                <span className="lesson-done-badge">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              </>
            )}
          </div>
        </header>

        <LessonContent content={lesson.content} />

        <div className="lesson-mark-wrap">
          <MarkCompleteButton
            articleId={lesson.id}
            initiallyCompleted={isCompleted}
            isLoggedIn={!!session}
          />
        </div>

        <div className="lesson-nav">
          {prevLesson ? (
            <Link href={`/learn/${prevLesson.slug}`} className="lesson-nav-prev">
              <svg className="lesson-nav-arrow" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <p className="lesson-nav-label">Previous</p>
                <p className="lesson-nav-title truncate">{prevLesson.title}</p>
              </div>
            </Link>
          ) : <div />}

          {nextLesson && (
            <Link href={`/learn/${nextLesson.slug}`} className="lesson-nav-next">
              <div>
                <p className="lesson-nav-label text-right">Next Lesson</p>
                <p className="lesson-nav-title truncate text-right">{nextLesson.title}</p>
              </div>
              <svg className="lesson-nav-arrow" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}
