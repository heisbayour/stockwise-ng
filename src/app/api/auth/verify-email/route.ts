// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp, createOtp } from "@/lib/auth-utils";
import { OtpType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { userId, code } = await req.json();
    if (!userId || !code) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ message: "Already verified" });

    const valid = await verifyOtp(userId, code, OtpType.EMAIL_VERIFICATION);
    if (!valid) return NextResponse.json({ error: "Invalid or expired code. Request a new one." }, { status: 400 });

    await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });
    return NextResponse.json({ message: "Email verified!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.emailVerified) return NextResponse.json({ error: "Cannot resend" }, { status: 400 });

    const code = await createOtp(userId, OtpType.EMAIL_VERIFICATION);
    console.log(`[DEV] Resend OTP for ${user.email}: ${code}`);

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
        to: user.email,
        subject: "Your New Stockwise Verification Code",
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#0A1628">New verification code</h2>
          <div style="background:#E6F7F5;border:2px solid #00B09B;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
            <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#00B09B">${code}</span>
          </div>
          <p style="color:#9CA3AF;font-size:13px">Expires in 10 minutes.</p>
        </div>`,
      });
    } catch (err) { console.error("Resend email error:", err); }

    return NextResponse.json({ message: "New code sent to your email." });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
