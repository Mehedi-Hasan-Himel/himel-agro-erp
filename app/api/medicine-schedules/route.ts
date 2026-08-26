import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MedicineScheduleModel from "@/models/MedicineSchedule";

export async function GET() {
  try {
    await connectDB();
    const schedules = await MedicineScheduleModel.find({}).sort({ startDate: 1 }).lean();
    const result = schedules.map((s) => ({ ...s, id: s._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/medicine-schedules error:", error);
    return NextResponse.json({ error: "Failed to fetch medicine schedules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Schedule ID (_id) is required" }, { status: 400 });
    }

    const schedule = new MedicineScheduleModel(body);
    await schedule.save();

    return NextResponse.json({ ...schedule.toJSON(), id: schedule._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/medicine-schedules error:", error);
    const message = error instanceof Error ? error.message : "Failed to create medicine schedule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
