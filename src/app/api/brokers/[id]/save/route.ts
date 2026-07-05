// src/app/api/brokers/[id]/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { id: brokerId } = await params;
  const existing = await prisma.savedBroker.findUnique({
    where: { userId_brokerId: { userId: session.user.id, brokerId } },
  });

  if (existing) {
    await prisma.savedBroker.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }
  await prisma.savedBroker.create({ data: { userId: session.user.id, brokerId } });
  return NextResponse.json({ saved: true });
}
