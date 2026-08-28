import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FeedPurchaseModel from "@/models/FeedPurchase";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const purchases = await FeedPurchaseModel.find({}).sort({ date: -1 }).lean();
      const result = purchases.map((p) => ({ ...p, id: p._id }));
      return NextResponse.json(result);
    }

    const purchases = fallbackStore.get().feedPurchases;
    return NextResponse.json(purchases);
  } catch (error) {
    console.error("GET /api/feed-purchases error:", error);
    const purchases = fallbackStore.get().feedPurchases;
    return NextResponse.json(purchases);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id;

    if (!id) {
      return NextResponse.json({ error: "Purchase ID (_id) is required" }, { status: 400 });
    }

    const doc = { ...body, _id: id, id, createdAt: body.createdAt || new Date().toISOString() };

    const db = await connectDB();
    if (db) {
      const purchase = new FeedPurchaseModel(doc);
      await purchase.save();
      return NextResponse.json({ ...purchase.toJSON(), id: purchase._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.feedPurchases.findIndex((p) => (p._id || p.id) === id);
    if (idx !== -1) {
      store.feedPurchases[idx] = doc;
    } else {
      store.feedPurchases.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/feed-purchases error:", error);
    const message = error instanceof Error ? error.message : "Failed to create feed purchase";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
