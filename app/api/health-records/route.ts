import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HealthRecordModel from "@/models/HealthRecord";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pigeonId = searchParams.get("pigeonId");

    const db = await connectDB();
    if (db) {
      let query = {};
      if (pigeonId) {
        query = { $or: [{ pigeonId }, { targetType: "FLOCK" }] };
      }
      const records = await HealthRecordModel.find(query).sort({ createdAt: -1 }).lean();
      const result = records.map((r) => ({ ...r, id: r._id }));
      return NextResponse.json(result);
    }

    let records = fallbackStore.get().healthRecords;
    if (pigeonId) {
      records = records.filter(
        (r) => r.pigeonId === pigeonId || r.targetType === "FLOCK"
      );
    }
    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/health-records error:", error);
    const records = fallbackStore.get().healthRecords;
    return NextResponse.json(records);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id;

    if (!id) {
      return NextResponse.json({ error: "Record ID (_id) is required" }, { status: 400 });
    }

    const doc = { ...body, _id: id, id, createdAt: body.createdAt || new Date().toISOString() };

    const db = await connectDB();
    if (db) {
      const record = new HealthRecordModel(doc);
      await record.save();
      return NextResponse.json({ ...record.toJSON(), id: record._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.healthRecords.findIndex((r) => (r._id || r.id) === id);
    if (idx !== -1) {
      store.healthRecords[idx] = doc;
    } else {
      store.healthRecords.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/health-records error:", error);
    const message = error instanceof Error ? error.message : "Failed to create health record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
