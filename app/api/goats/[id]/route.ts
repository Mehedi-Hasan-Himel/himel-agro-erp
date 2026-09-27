import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import GoatModel from "@/models/Goat";
import { fallbackStore } from "@/lib/fallbackStore";
import fs from "fs";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    const db = await connectDB();
    if (db) {
      const goat = await GoatModel.findOne({
        $or: [{ _id: decodedId }, { tagNumber: decodedId }],
      }).lean();
      if (goat) {
        return NextResponse.json({ ...goat, id: goat._id });
      }
    }

    const store = fallbackStore.get();
    const goat = (store.goats || []).find(
      (g) => (g._id || g.id) === decodedId || g.tagNumber === decodedId
    );
    if (!goat) {
      return NextResponse.json({ error: "Goat not found" }, { status: 404 });
    }
    return NextResponse.json(goat);
  } catch (error: unknown) {
    console.error("GET /api/goats/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch goat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const body = await request.json();
    const updatedAt = new Date().toISOString();

    const db = await connectDB();
    if (db) {
      const updated = await GoatModel.findOneAndUpdate(
        { $or: [{ _id: decodedId }, { tagNumber: decodedId }] },
        { $set: { ...body, updatedAt } },
        { new: true }
      ).lean();
      if (!updated) {
        return NextResponse.json({ error: "Goat not found" }, { status: 404 });
      }
      return NextResponse.json({ ...updated, id: updated._id });
    }

    const store = fallbackStore.get();
    const idx = (store.goats || []).findIndex(
      (g) => (g._id || g.id) === decodedId || g.tagNumber === decodedId
    );
    if (idx === -1) {
      return NextResponse.json({ error: "Goat not found" }, { status: 404 });
    }

    const existing = store.goats[idx];
    const merged = { ...existing, ...body, updatedAt };
    store.goats[idx] = merged;

    try {
      const filePath = path.join(process.cwd(), "data", "goats.json");
      fs.writeFileSync(filePath, JSON.stringify(store.goats, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not persist goats to disk:", e);
    }

    return NextResponse.json(merged);
  } catch (error: unknown) {
    console.error("PUT /api/goats/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update goat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    const db = await connectDB();
    if (db) {
      const result = await GoatModel.findOneAndDelete({
        $or: [{ _id: decodedId }, { tagNumber: decodedId }],
      });
      if (!result) {
        return NextResponse.json({ error: "Goat not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Goat deleted" });
    }

    const store = fallbackStore.get();
    const idx = (store.goats || []).findIndex(
      (g) => (g._id || g.id) === decodedId || g.tagNumber === decodedId
    );
    if (idx === -1) {
      return NextResponse.json({ error: "Goat not found" }, { status: 404 });
    }

    store.goats.splice(idx, 1);

    try {
      const filePath = path.join(process.cwd(), "data", "goats.json");
      fs.writeFileSync(filePath, JSON.stringify(store.goats, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not persist goats to disk:", e);
    }

    return NextResponse.json({ success: true, message: "Goat deleted" });
  } catch (error: unknown) {
    console.error("DELETE /api/goats/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete goat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
