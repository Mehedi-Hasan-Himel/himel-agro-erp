import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BreedingRoundModel from "@/models/BreedingRound";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const pairId = searchParams.get("pairId");

    const query = pairId ? { pairId } : {};
    const rounds = await BreedingRoundModel.find(query).sort({ createdAt: -1 }).lean();
    const result = rounds.map((r) => ({ ...r, id: r._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/breeding-rounds error:", error);
    return NextResponse.json({ error: "Failed to fetch breeding rounds" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Round ID (_id) is required" }, { status: 400 });
    }

    const round = new BreedingRoundModel(body);
    await round.save();

    return NextResponse.json({ ...round.toJSON(), id: round._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/breeding-rounds error:", error);
    const message = error instanceof Error ? error.message : "Failed to create breeding round";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
