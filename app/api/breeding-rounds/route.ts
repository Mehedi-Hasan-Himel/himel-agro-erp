import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BreedingRoundModel from "@/models/BreedingRound";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pairId = searchParams.get("pairId");

    const db = await connectDB();
    if (db) {
      const query = pairId ? { pairId } : {};
      const rounds = await BreedingRoundModel.find(query).sort({ createdAt: -1 }).lean();
      const result = rounds.map((r) => ({ ...r, id: r._id }));
      return NextResponse.json(result);
    }

    let rounds = fallbackStore.get().breedingRounds;
    if (pairId) {
      rounds = rounds.filter((r) => r.pairId === pairId);
    }
    return NextResponse.json(rounds);
  } catch (error) {
    console.error("GET /api/breeding-rounds error:", error);
    const rounds = fallbackStore.get().breedingRounds;
    return NextResponse.json(rounds);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id;

    if (!id) {
      return NextResponse.json({ error: "Round ID (_id) is required" }, { status: 400 });
    }

    const doc = { ...body, _id: id, id, createdAt: body.createdAt || new Date().toISOString() };

    const db = await connectDB();
    if (db) {
      const round = await BreedingRoundModel.findByIdAndUpdate(
        id,
        { $set: doc },
        { upsert: true, new: true }
      );
      return NextResponse.json({ ...round.toJSON(), id: round._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.breedingRounds.findIndex((r) => (r._id || r.id) === id);
    if (idx !== -1) {
      store.breedingRounds[idx] = doc;
    } else {
      store.breedingRounds.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/breeding-rounds error:", error);
    const message = error instanceof Error ? error.message : "Failed to create breeding round";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
