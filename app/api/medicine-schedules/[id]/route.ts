import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MedicineScheduleModel from "@/models/MedicineSchedule";

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

    const schedule = await MedicineScheduleModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!schedule) {
      return NextResponse.json({ error: "Medicine schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ ...schedule, id: schedule._id });
  } catch (error) {
    console.error("PUT /api/medicine-schedules/[id] error:", error);
    return NextResponse.json({ error: "Failed to update medicine schedule" }, { status: 500 });
  }
}
