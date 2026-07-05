// src/app/api/brokers/[id]/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brokerId } = await params;
    const { userId } = await req.json().catch(() => ({}));
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;
    const referrer = req.headers.get("referer") ?? null;

    await prisma.brokerClick.create({
      data: { brokerId, userId: userId || null, ipAddress: ip, userAgent, referrer },
    });
    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ tracked: false });
  }
}
