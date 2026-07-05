// src/app/api/learn/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { id: articleId } = await params;
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  await prisma.learningProgress.upsert({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    create: { userId: session.user.id, articleId, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date(), lastRead: new Date() },
  });

  return NextResponse.json({ message: "Marked as complete" });
}
