// src/app/api/admin/articles/[id]/route.ts
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();

    // Authors can only edit their own articles
    if (session.user.role === "AUTHOR") {
      const article = await prisma.article.findUnique({ where: { id }, select: { authorId: true } });
      if (article?.authorId !== session.user.id) {
        return NextResponse.json({ error: "You can only edit your own articles" }, { status: 403 });
      }
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...body,
        publishedAt: body.isPublished ? (body.publishedAt ?? new Date()) : null,
      },
    });

    return NextResponse.json({ message: "Updated", id: updated.id });
  } catch (err) {
    console.error("Article update error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "SUPERUSER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
