// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp, hashPassword } from "@/lib/auth-utils";
import { OtpType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { userId, code, newPassword } = await req.json();
    if (!userId || !code || !newPassword) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const valid = await verifyOtp(userId, code, OtpType.PASSWORD_RESET);
    if (!valid) return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
