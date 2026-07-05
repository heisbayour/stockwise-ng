// src/app/api/watchlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.watchlist.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.watchlist.delete({ where: { id } });
  return NextResponse.json({ message: "Removed" });
}
