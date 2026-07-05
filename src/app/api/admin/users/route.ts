// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  if (!["ADMIN", "SUPERUSER"].includes(session.user.role)) return null;
  return session;
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId, action, role } = await req.json();

    // Prevent actions on SUPERUSER accounts
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (target?.role === "SUPERUSER" && session.user.role !== "SUPERUSER") {
      return NextResponse.json({ error: "Cannot modify superuser" }, { status: 403 });
    }

    switch (action) {
      case "verifyNin":
        await prisma.user.update({ where: { id: userId }, data: { ninVerified: true } });
        break;
      case "setRole":
        if (!role) return NextResponse.json({ error: "Role required" }, { status: 400 });
        // Only SUPERUSER can create ADMIN or SUPERUSER
        if (["ADMIN", "SUPERUSER"].includes(role) && session.user.role !== "SUPERUSER") {
          return NextResponse.json({ error: "Only superuser can promote to admin" }, { status: 403 });
        }
        await prisma.user.update({ where: { id: userId }, data: { role } });
        break;
      case "suspend":
        await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
        break;
      case "activate":
        await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ message: "Done" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
