// src/app/(main)/dashboard/saved-brokers/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatNaira } from "@/lib/formatters";
import UnsaveBrokerButton from "@/components/dashboard/UnsaveBrokerButton";

export default async function SavedBrokersPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const saved = await prisma.savedBroker.findMany({
    where: { userId },
    include: { broker: { include: { _count: { select: { reviews: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 sw-text-ink">Saved Brokers</h1>
      <p className="text-gray-500 text-sm mb-6">Brokers you have bookmarked</p>

      {saved.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-gray-500 mb-4">No saved brokers yet</p>
          <Link href="/brokers" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-white text-sm sw-btn-primary">
            Browse Brokers
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map((sb) => (
            <div key={sb.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/brokers/${sb.broker.slug}`} className="font-semibold text-gray-900 hover:text-[color:var(--color-teal)] transition-colors">
                  {sb.broker.name}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{formatNaira(sb.broker.minimumDeposit)} min.</span>
                  <span>{sb.broker.tradingFeePercent}% fee</span>
                  <span>{sb.broker._count.reviews} reviews</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {sb.broker.secLicensed && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium sw-badge-teal">SEC</span>
                )}
                <UnsaveBrokerButton brokerId={sb.broker.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
