// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Login required" }, { status: 401 });

  try {
    const { firstName, lastName, phone, nin } = await req.json();

    // Check if user's NIN is already verified - don't allow editing verified NIN
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { ninVerified: true } });
    const ninUpdate = user?.ninVerified ? {} : {
      nin: nin || undefined,
      ...(nin ? { ninSubmitted: true } : {}),
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { firstName, lastName, phone: phone || undefined, ...ninUpdate },
    });
    return NextResponse.json({ message: "Profile updated" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
