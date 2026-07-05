// src/app/api/watchlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Login required" }, { status: 401 });

  try {
    const { ticker, companyName } = await req.json();
    if (!ticker || !companyName) return NextResponse.json({ error: "Ticker and company name required" }, { status: 400 });

    const item = await prisma.watchlist.create({
      data: { userId: session.user.id, ticker: ticker.toUpperCase(), companyName },
    });
    return NextResponse.json({ message: "Added", item }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "This stock is already in your watchlist" }, { status: 409 });
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
