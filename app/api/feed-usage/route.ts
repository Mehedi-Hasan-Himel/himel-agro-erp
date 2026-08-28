import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FeedUsageModel from "@/models/FeedUsage";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const usages = await FeedUsageModel.find({}).sort({ date: -1 }).lean();
      const result = usages.map((u) => ({ ...u, id: u._id }));
      return NextResponse.json(result);
    }

    const usages = fallbackStore.get().feedUsage;
    return NextResponse.json(usages);
  } catch (error) {
    console.error("GET /api/feed-usage error:", error);
    const usages = fallbackStore.get().feedUsage;
    return NextResponse.json(usages);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id;

    if (!id) {
      return NextResponse.json({ error: "Usage ID (_id) is required" }, { status: 400 });
    }

    const doc = { ...body, _id: id, id, createdAt: body.createdAt || new Date().toISOString() };

    const db = await connectDB();
    if (db) {
      const usage = new FeedUsageModel(doc);
      await usage.save();
      return NextResponse.json({ ...usage.toJSON(), id: usage._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.feedUsage.findIndex((u) => (u._id || u.id) === id);
    if (idx !== -1) {
      store.feedUsage[idx] = doc;
    } else {
      store.feedUsage.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/feed-usage error:", error);
    const message = error instanceof Error ? error.message : "Failed to create feed usage record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
