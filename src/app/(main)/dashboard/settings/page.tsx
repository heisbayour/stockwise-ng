// src/app/(main)/dashboard/settings/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true, lastName: true, email: true, phone: true,
      nin: true, ninSubmitted: true, ninVerified: true,
      emailVerified: true, phoneVerified: true, role: true,
    },
  });

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 sw-text-ink">Account Settings</h1>
      <p className="text-gray-500 text-sm mb-6">Manage your profile and account information</p>
      <SettingsForm user={user} />
    </div>
  );
}
