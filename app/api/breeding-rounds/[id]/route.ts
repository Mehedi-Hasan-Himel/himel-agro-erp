import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BreedingRoundModel from "@/models/BreedingRound";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    delete body._id;
    delete body.id;

    const round = await BreedingRoundModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!round) {
      return NextResponse.json({ error: "Breeding round not found" }, { status: 404 });
    }

    return NextResponse.json({ ...round, id: round._id });
  } catch (error) {
    console.error("PUT /api/breeding-rounds/[id] error:", error);
    return NextResponse.json({ error: "Failed to update breeding round" }, { status: 500 });
  }
}
