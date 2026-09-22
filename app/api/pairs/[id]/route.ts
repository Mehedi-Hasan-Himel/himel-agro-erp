import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PairModel from "@/models/Pair";
import { fallbackStore } from "@/lib/fallbackStore";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    delete body._id;
    delete body.id;

    const db = await connectDB();
    if (db) {
      const pair = await PairModel.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      ).lean();

      if (!pair) {
        return NextResponse.json({ error: "Pair not found" }, { status: 404 });
      }

      return NextResponse.json({ ...pair, id: pair._id });
    }

    const store = fallbackStore.get();
    const idx = store.pairs.findIndex((p: any) => (p._id || p.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Pair not found" }, { status: 404 });
    }

    store.pairs[idx] = { ...store.pairs[idx], ...body, updatedAt: new Date().toISOString() };
    return NextResponse.json(store.pairs[idx]);
  } catch (error) {
    console.error("PUT /api/pairs/[id] error:", error);
    return NextResponse.json({ error: "Failed to update pair" }, { status: 500 });
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
      const deleted = await PairModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        return NextResponse.json({ error: "Pair not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: `Pair ${id} deleted.` });
    }

    const store = fallbackStore.get();
    const idx = store.pairs.findIndex((p: any) => (p._id || p.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Pair not found" }, { status: 404 });
    }

    store.pairs.splice(idx, 1);
    return NextResponse.json({ success: true, message: `Pair ${id} deleted.` });
  } catch (error) {
    console.error("DELETE /api/pairs/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete pair" }, { status: 500 });
  }
}
