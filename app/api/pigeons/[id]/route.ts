import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectDB();
    if (db) {
      const pigeon = await PigeonModel.findById(id).lean();
      if (!pigeon) {
        return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
      }
      return NextResponse.json({ ...pigeon, id: pigeon._id });
    }

    const pigeons = fallbackStore.get().pigeons;
    const found = pigeons.find((p) => (p._id || p.id) === id);
    if (!found) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }
    return NextResponse.json({ ...found, id: (found._id || found.id) });
  } catch (error) {
    console.error("GET /api/pigeons/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch pigeon" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Prevent _id modification
    delete body._id;
    delete body.id;

    const db = await connectDB();
    if (db) {
      const pigeon = await PigeonModel.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      ).lean();

      if (!pigeon) {
        return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
      }

      return NextResponse.json({ ...pigeon, id: pigeon._id });
    }

    const pigeons = fallbackStore.get().pigeons;
    const idx = pigeons.findIndex((p) => (p._id || p.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }
    pigeons[idx] = { ...pigeons[idx], ...body, id, _id: id };
    return NextResponse.json(pigeons[idx]);
  } catch (error) {
    console.error("PUT /api/pigeons/[id] error:", error);
    return NextResponse.json({ error: "Failed to update pigeon" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectDB();
    if (db) {
      const deleted = await PigeonModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: `Pigeon ${id} deleted permanently.` });
    }

    const store = fallbackStore.get();
    const idx = store.pigeons.findIndex((p) => (p._id || p.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }

    store.pigeons.splice(idx, 1);

    // Also end any active pairs containing this pigeon
    store.pairs = store.pairs.map((pair) => {
      if ((pair.maleId === id || pair.femaleId === id) && pair.status === "ACTIVE") {
        return { ...pair, status: "ENDED", endDate: new Date().toISOString().split("T")[0] };
      }
      return pair;
    });

    return NextResponse.json({ success: true, message: `Pigeon ${id} deleted permanently.` });
  } catch (error) {
    console.error("DELETE /api/pigeons/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete pigeon" }, { status: 500 });
  }
}
