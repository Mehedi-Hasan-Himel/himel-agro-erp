import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const pigeon = await PigeonModel.findById(id).lean();
    if (!pigeon) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }
    return NextResponse.json({ ...pigeon, id: pigeon._id });
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
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Prevent _id modification
    delete body._id;
    delete body.id;

    const pigeon = await PigeonModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!pigeon) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }

    return NextResponse.json({ ...pigeon, id: pigeon._id });
  } catch (error) {
    console.error("PUT /api/pigeons/[id] error:", error);
    return NextResponse.json({ error: "Failed to update pigeon" }, { status: 500 });
  }
}
