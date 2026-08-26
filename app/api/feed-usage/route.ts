import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FeedUsageModel from "@/models/FeedUsage";

export async function GET() {
  try {
    await connectDB();
    const usages = await FeedUsageModel.find({}).sort({ date: -1 }).lean();
    const result = usages.map((u) => ({ ...u, id: u._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/feed-usage error:", error);
    return NextResponse.json({ error: "Failed to fetch feed usage" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Usage ID (_id) is required" }, { status: 400 });
    }

    const usage = new FeedUsageModel(body);
    await usage.save();

    return NextResponse.json({ ...usage.toJSON(), id: usage._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/feed-usage error:", error);
    const message = error instanceof Error ? error.message : "Failed to create feed usage record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
