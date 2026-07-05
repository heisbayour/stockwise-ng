// src/app/api/brokers/[id]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { id: brokerId } = await params;
  try {
    const body = await req.json();
    const v = schema.safeParse(body);
    if (!v.success) return NextResponse.json({ error: "Invalid rating" }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        brokerId,
        rating: v.data.rating,
        title: v.data.title,
        body: v.data.body,
        isApproved: false,
      },
    });
    return NextResponse.json({ message: "Review submitted for approval", review }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "You have already reviewed this broker" }, { status: 409 });
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
