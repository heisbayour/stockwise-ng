// src/app/api/admin/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  if (!["ADMIN", "SUPERUSER", "AUTHOR"].includes(session.user.role)) return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, slug, excerpt, content, category, lessonNumber, readingTime, isPublished, authorId, authorName, tags, coverImage } = body;

    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json({ error: "Title, slug, excerpt, and content are required" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "An article with this slug already exists" }, { status: 409 });

    const article = await prisma.article.create({
      data: {
        title, slug, excerpt, content, category: category ?? "LESSON",
        lessonNumber: lessonNumber ?? null,
        readingTime: readingTime ?? null,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
        authorId: authorId ?? session.user.id,
        authorName: authorName ?? "Stockwise Team",
        tags: tags ?? [],
        coverImage: coverImage ?? null,
      },
    });

    return NextResponse.json({ message: "Article created", id: article.id }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    console.error("Article create error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
