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
      <h1 className="dash-page-title">Saved Brokers</h1>
      <p className="dash-page-sub">Brokers you have bookmarked</p>

      {saved.length === 0 ? (
        <div className="dash-widget">
          <div className="dash-empty">
            <p>No saved brokers yet</p>
            <Link href="/brokers" className="btn btn-primary">Browse Brokers</Link>
          </div>
        </div>
      ) : (
        <div>
          {saved.map((sb) => (
            <div key={sb.id} className="saved-broker-row">
              <div className="saved-broker-main">
                <Link href={`/brokers/${sb.broker.slug}`} className="saved-broker-name">
                  {sb.broker.name}
                </Link>
                <div className="saved-broker-meta font-mono">
                  <span>{formatNaira(sb.broker.minimumDeposit)} min.</span>
                  <span>{sb.broker.tradingFeePercent}% fee</span>
                  <span>{sb.broker._count.reviews} reviews</span>
                </div>
              </div>
              <div className="saved-broker-actions">
                {sb.broker.secLicensed && <span className="badge badge-teal">SEC</span>}
                <UnsaveBrokerButton brokerId={sb.broker.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
