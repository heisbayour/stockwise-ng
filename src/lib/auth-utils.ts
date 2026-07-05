// src/lib/auth-utils.ts
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { OtpType } from "@prisma/client";

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 12);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtp(userId: string, type: OtpType): Promise<string> {
  const code = generateOtpCode();

  await prisma.otpToken.updateMany({
    where: { userId, type, used: false },
    data: { used: true },
  });

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpToken.create({
    data: { userId, code, type, expiresAt },
  });

  return code;
}

export async function verifyOtp(userId: string, code: string, type: OtpType): Promise<boolean> {
  const token = await prisma.otpToken.findFirst({
    where: {
      userId,
      code,
      type,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!token) return false;

  await prisma.otpToken.update({
    where: { id: token.id },
    data: { used: true },
  });

  return true;
}
