import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PairModel from "@/models/Pair";

export async function GET() {
  try {
    await connectDB();
    const pairs = await PairModel.find({}).sort({ createdAt: -1 }).lean();
    const result = pairs.map((p) => ({ ...p, id: p._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/pairs error:", error);
    return NextResponse.json({ error: "Failed to fetch pairs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Pair ID (_id) is required" }, { status: 400 });
    }

    const pair = new PairModel(body);
    await pair.save();

    return NextResponse.json({ ...pair.toJSON(), id: pair._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/pairs error:", error);
    const message = error instanceof Error ? error.message : "Failed to create pair";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
