import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FeedPurchaseModel from "@/models/FeedPurchase";

export async function GET() {
  try {
    await connectDB();
    const purchases = await FeedPurchaseModel.find({}).sort({ date: -1 }).lean();
    const result = purchases.map((p) => ({ ...p, id: p._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/feed-purchases error:", error);
    return NextResponse.json({ error: "Failed to fetch feed purchases" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Purchase ID (_id) is required" }, { status: 400 });
    }

    const purchase = new FeedPurchaseModel(body);
    await purchase.save();

    return NextResponse.json({ ...purchase.toJSON(), id: purchase._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/feed-purchases error:", error);
    const message = error instanceof Error ? error.message : "Failed to create feed purchase";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
