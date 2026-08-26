import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HealthRecordModel from "@/models/HealthRecord";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const pigeonId = searchParams.get("pigeonId");

    let query = {};
    if (pigeonId) {
      // Return records for this pigeon OR flock-wide records
      query = { $or: [{ pigeonId }, { targetType: "FLOCK" }] };
    }

    const records = await HealthRecordModel.find(query).sort({ createdAt: -1 }).lean();
    const result = records.map((r) => ({ ...r, id: r._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/health-records error:", error);
    return NextResponse.json({ error: "Failed to fetch health records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Record ID (_id) is required" }, { status: 400 });
    }

    const record = new HealthRecordModel(body);
    await record.save();

    return NextResponse.json({ ...record.toJSON(), id: record._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/health-records error:", error);
    const message = error instanceof Error ? error.message : "Failed to create health record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
