import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FlyingRecordModel from "@/models/FlyingRecord";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const record = await FlyingRecordModel.findByIdAndDelete(id);
    if (!record) {
      return NextResponse.json({ error: "Flying record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/flying-records/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete flying record" }, { status: 500 });
  }
}
