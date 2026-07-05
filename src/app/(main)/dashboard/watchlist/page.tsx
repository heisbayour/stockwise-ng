// src/app/(main)/dashboard/watchlist/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WatchlistManager from "@/components/dashboard/WatchlistManager";

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { addedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 sw-text-ink">Watchlist</h1>
      <p className="text-gray-500 text-sm mb-6">
        Track Nigerian stocks you are interested in.{" "}
        <a href="https://ngxgroup.com" target="_blank" rel="noopener noreferrer" className="font-medium sw-text-brand">
          Check live prices on NGX
        </a>
      </p>
      <WatchlistManager initialItems={watchlist} />
    </div>
  );
}
