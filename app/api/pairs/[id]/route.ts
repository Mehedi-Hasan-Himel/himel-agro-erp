import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PairModel from "@/models/Pair";

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

    const pair = await PairModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!pair) {
      return NextResponse.json({ error: "Pair not found" }, { status: 404 });
    }

    return NextResponse.json({ ...pair, id: pair._id });
  } catch (error) {
    console.error("PUT /api/pairs/[id] error:", error);
    return NextResponse.json({ error: "Failed to update pair" }, { status: 500 });
  }
}
