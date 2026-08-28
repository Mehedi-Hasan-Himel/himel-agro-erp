import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FlyingRecordModel from "@/models/FlyingRecord";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pigeonId = searchParams.get("pigeonId");

    const db = await connectDB();
    if (db) {
      const query = pigeonId ? { pigeonId } : {};
      const records = await FlyingRecordModel.find(query).sort({ date: -1 }).lean();
      const result = records.map((r) => ({ ...r, id: r._id }));
      return NextResponse.json(result);
    }

    let records = fallbackStore.get().flyingRecords;
    if (pigeonId) {
      records = records.filter((r) => r.pigeonId === pigeonId);
    }
    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/flying-records error:", error);
    const records = fallbackStore.get().flyingRecords;
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
      const record = new FlyingRecordModel(doc);
      await record.save();
      return NextResponse.json({ ...record.toJSON(), id: record._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.flyingRecords.findIndex((r) => (r._id || r.id) === id);
    if (idx !== -1) {
      store.flyingRecords[idx] = doc;
    } else {
      store.flyingRecords.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/flying-records error:", error);
    const message = error instanceof Error ? error.message : "Failed to create flying record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
