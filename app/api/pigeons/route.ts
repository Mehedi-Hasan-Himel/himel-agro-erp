import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const pigeons = await PigeonModel.find({}).sort({ createdAt: -1 }).lean();
      const result = pigeons.map((p) => ({ ...p, id: p._id }));
      return NextResponse.json(result);
    }

    const pigeons = fallbackStore.get().pigeons;
    return NextResponse.json(pigeons);
  } catch (error) {
    console.error("GET /api/pigeons error:", error);
    const pigeons = fallbackStore.get().pigeons;
    return NextResponse.json(pigeons);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id;

    if (!id) {
      return NextResponse.json({ error: "Pigeon ID (_id) is required" }, { status: 400 });
    }

    const doc = { ...body, _id: id, id, createdAt: body.createdAt || new Date().toISOString() };

    const db = await connectDB();
    if (db) {
      const pigeon = new PigeonModel(doc);
      await pigeon.save();
      return NextResponse.json({ ...pigeon.toJSON(), id: pigeon._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.pigeons.findIndex((p) => (p._id || p.id) === id);
    if (idx !== -1) {
      store.pigeons[idx] = doc;
    } else {
      store.pigeons.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/pigeons error:", error);
    const message = error instanceof Error ? error.message : "Failed to create pigeon";
    const status = (error as { code?: number })?.code === 11000 ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
