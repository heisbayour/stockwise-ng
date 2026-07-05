// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createOtp } from "@/lib/auth-utils";
import { OtpType } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must have at least one uppercase letter")
    .regex(/[0-9]/, "Password must have at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const v = schema.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: "Validation failed", fields: v.error.flatten().fieldErrors }, { status: 400 });
    }
    const { firstName, lastName, email, phone, password } = v.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { firstName, lastName, email: normalizedEmail, phone: phone || null, passwordHash, emailVerified: false },
      select: { id: true, email: true, firstName: true },
    });

    const otpCode = await createOtp(user.id, OtpType.EMAIL_VERIFICATION);
    await sendVerificationEmail(user.email, user.firstName ?? "there", otpCode);
    console.log(`[DEV] OTP for ${user.email}: ${otpCode}`);

    return NextResponse.json({ message: "Account created! Check your email.", userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

async function sendVerificationEmail(email: string, name: string, code: string) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: email,
      subject: "Your Stockwise Verification Code",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-flex;align-items:center;gap:8px">
            <div style="width:32px;height:32px;background:#00B09B;border-radius:8px;display:inline-flex;align-items:center;justify-content:center">
              <svg width="20" height="20" fill="white" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
            </div>
            <span style="font-size:18px;font-weight:700;color:#0A1628">Stockwise</span>
          </div>
        </div>
        <h2 style="color:#0A1628;font-size:22px;margin-bottom:8px">Welcome, ${name}!</h2>
        <p style="color:#6B7280;margin-bottom:24px">Enter this code to verify your email address:</p>
        <div style="background:#E6F7F5;border:2px solid #00B09B;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#00B09B">${code}</span>
        </div>
        <p style="color:#9CA3AF;font-size:13px">This code expires in 10 minutes. If you did not create a Stockwise account, ignore this email.</p>
      </div>`,
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
}
