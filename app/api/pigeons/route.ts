import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";
import { fallbackStore } from "@/lib/fallbackStore";

function normalizePigeon(p: any) {
  if (!p) return p;
  const breed = p.breed === "Giribaz / Local" ? "Giribaz" : (p.breed || "Giribaz");
  const breedInitial = breed.trim().charAt(0).toUpperCase() || "G";
  const serialStr = String(p.ringSerial || 1).padStart(2, "0");
  const canonicalId = `${p.ringYear || 2026}-${serialStr}-${breedInitial}`;
  return { ...p, breed, id: canonicalId, _id: canonicalId };
}

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const pigeons = await PigeonModel.find({}).sort({ createdAt: -1 }).lean();
      const result = pigeons.map(normalizePigeon);
      return NextResponse.json(result);
    }

    const pigeons = fallbackStore.get().pigeons;
    return NextResponse.json(pigeons.map(normalizePigeon));
  } catch (error) {
    console.error("GET /api/pigeons error:", error);
    const pigeons = fallbackStore.get().pigeons;
    return NextResponse.json(pigeons.map(normalizePigeon));
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] = body.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Please provide an array of pigeon IDs to delete." }, { status: 400 });
    }

    const db = await connectDB();
    if (db) {
      const result = await PigeonModel.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Successfully deleted ${result.deletedCount} pigeons.`,
      });
    }

    const store = fallbackStore.get();
    const idSet = new Set(ids);
    const initialCount = store.pigeons.length;
    store.pigeons = store.pigeons.filter((p) => !idSet.has(String(p._id || p.id)));
    const deletedCount = initialCount - store.pigeons.length;

    // Also update any active pairs that contain any of the deleted pigeons
    store.pairs = store.pairs.map((pair) => {
      const maleId = String(pair.maleId || "");
      const femaleId = String(pair.femaleId || "");
      if ((idSet.has(maleId) || idSet.has(femaleId)) && pair.status === "ACTIVE") {
        return { ...pair, status: "ENDED", endDate: new Date().toISOString().split("T")[0] };
      }
      return pair;
    });

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} pigeons.`,
    });
  } catch (error) {
    console.error("DELETE /api/pigeons bulk error:", error);
    return NextResponse.json({ error: "Failed to perform bulk pigeon deletion" }, { status: 500 });
  }
}
