import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PairModel from "@/models/Pair";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const pairs = await PairModel.find({}).sort({ createdAt: -1 }).lean();
      const result = pairs.map((p) => ({ ...p, id: p._id }));
      return NextResponse.json(result);
    }

    const pairs = fallbackStore.get().pairs;
    return NextResponse.json(pairs);
  } catch (error) {
    console.error("GET /api/pairs error:", error);
    const pairs = fallbackStore.get().pairs;
    return NextResponse.json(pairs);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id || (body.maleId && body.femaleId ? `${String(body.maleId).trim()}_${String(body.femaleId).trim()}` : undefined);

    if (!id) {
      return NextResponse.json({ error: "Pair ID (_id) is required" }, { status: 400 });
    }

    const doc = { ...body, _id: id, id, createdAt: body.createdAt || new Date().toISOString() };

    const db = await connectDB();
    if (db) {
      const pair = new PairModel(doc);
      await pair.save();
      return NextResponse.json({ ...pair.toJSON(), id: pair._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.pairs.findIndex((p) => (p._id || p.id) === id);
    if (idx !== -1) {
      store.pairs[idx] = doc;
    } else {
      store.pairs.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/pairs error:", error);
    const message = error instanceof Error ? error.message : "Failed to create pair";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
