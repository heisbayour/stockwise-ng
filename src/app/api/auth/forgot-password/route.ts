// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/auth-utils";
import { OtpType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Return success even if user not found - security best practice (prevents email enumeration)
    if (!user) return NextResponse.json({ message: "If this email exists, a reset code was sent.", userId: "not-found" });

    const code = await createOtp(user.id, OtpType.PASSWORD_RESET);
    console.log(`[DEV] Password reset OTP for ${user.email}: ${code}`);

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
        to: user.email,
        subject: "Reset Your Stockwise Password",
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#0A1628">Password Reset Request</h2>
          <p style="color:#6B7280">Use this code to reset your password:</p>
          <div style="background:#FEF3C7;border:2px solid #F59E0B;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
            <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#D97706">${code}</span>
          </div>
          <p style="color:#9CA3AF;font-size:13px">Expires in 10 minutes. If you did not request this, ignore this email.</p>
        </div>`,
      });
    } catch (err) { console.error("Email error:", err); }

    return NextResponse.json({ message: "Reset code sent.", userId: user.id });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
