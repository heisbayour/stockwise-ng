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
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/learn" className="hover:text-gray-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Roadmap
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Lesson header */}
        <header className="mb-8">
          {lesson.lessonNumber && (
            <span className="text-xs font-semibold uppercase tracking-wider sw-text-brand">
              Lesson {lesson.lessonNumber} of 10
            </span>
          )}
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold leading-tight sw-text-ink">
            {lesson.title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
            <span>{lesson.readingTime} min read</span>
            <span>By {lesson.author ? `${lesson.author.firstName} ${lesson.author.lastName}` : lesson.authorName}</span>
            {isCompleted && (
              <span className="flex items-center gap-1 font-medium sw-text-brand">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Completed
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <LessonContent content={lesson.content} />

        {/* Mark complete */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <MarkCompleteButton
            articleId={lesson.id}
            initiallyCompleted={isCompleted}
            isLoggedIn={!!session}
          />
        </div>

        {/* Navigation */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {prevLesson ? (
            <Link href={`/learn/${prevLesson.slug}`}
              className="flex items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-[color:var(--color-teal)] transition-all group">
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[color:var(--color-teal)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Previous</p>
                <p className="text-sm font-medium text-gray-900 truncate">{prevLesson.title}</p>
              </div>
            </Link>
          ) : <div />}

          {nextLesson && (
            <Link href={`/learn/${nextLesson.slug}`}
              className="flex items-center justify-end gap-2 p-4 rounded-2xl border border-gray-100 hover:border-[color:var(--color-teal)] transition-all group col-start-2">
              <div className="min-w-0 text-right">
                <p className="text-xs text-gray-400">Next Lesson</p>
                <p className="text-sm font-medium text-gray-900 truncate">{nextLesson.title}</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[color:var(--color-teal)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}
