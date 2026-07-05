// src/app/api/admin/brokers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "SUPERUSER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { brokerId, action, value } = await req.json();

    switch (action) {
      case "setActive":
        await prisma.broker.update({ where: { id: brokerId }, data: { isActive: value } });
        break;
      case "setFeatured":
        await prisma.broker.update({ where: { id: brokerId }, data: { isFeatured: value } });
        break;
      case "approveReviews":
        await prisma.review.updateMany({ where: { brokerId, isApproved: false }, data: { isApproved: true } });
        break;
      case "updateTrustScore":
        // Recalculate trust score based on reviews average + base score
        const reviews = await prisma.review.findMany({ where: { brokerId, isApproved: true }, select: { rating: true } });
        const broker = await prisma.broker.findUnique({ where: { id: brokerId }, select: { yearsOperating: true, secLicensed: true } });
        if (broker) {
          const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 3;
          const yearsScore = Math.min((broker.yearsOperating ?? 0) * 2, 30);
          const secScore = broker.secLicensed ? 20 : 0;
          const reviewScore = (avgRating / 5) * 50;
          const trustScore = Math.round(reviewScore + yearsScore + secScore);
          await prisma.broker.update({ where: { id: brokerId }, data: { trustScore } });
        }
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ message: "Done" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
