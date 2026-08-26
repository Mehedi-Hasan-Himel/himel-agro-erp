import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FlyingRecordModel from "@/models/FlyingRecord";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const pigeonId = searchParams.get("pigeonId");

    const query = pigeonId ? { pigeonId } : {};
    const records = await FlyingRecordModel.find(query).sort({ date: -1 }).lean();
    const result = records.map((r) => ({ ...r, id: r._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/flying-records error:", error);
    return NextResponse.json({ error: "Failed to fetch flying records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Record ID (_id) is required" }, { status: 400 });
    }

    const record = new FlyingRecordModel(body);
    await record.save();

    return NextResponse.json({ ...record.toJSON(), id: record._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/flying-records error:", error);
    const message = error instanceof Error ? error.message : "Failed to create flying record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
