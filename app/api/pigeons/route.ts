import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";

export async function GET() {
  try {
    await connectDB();
    const pigeons = await PigeonModel.find({}).sort({ createdAt: -1 }).lean();
    const result = pigeons.map((p) => ({ ...p, id: p._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/pigeons error:", error);
    return NextResponse.json({ error: "Failed to fetch pigeons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Pigeon ID (_id) is required" }, { status: 400 });
    }

    const pigeon = new PigeonModel(body);
    await pigeon.save();

    return NextResponse.json({ ...pigeon.toJSON(), id: pigeon._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/pigeons error:", error);
    const message = error instanceof Error ? error.message : "Failed to create pigeon";
    const status = (error as { code?: number })?.code === 11000 ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
