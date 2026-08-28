import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MedicineScheduleModel from "@/models/MedicineSchedule";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const schedules = await MedicineScheduleModel.find({}).sort({ startDate: 1 }).lean();
      const result = schedules.map((s) => ({ ...s, id: s._id }));
      return NextResponse.json(result);
    }

    const schedules = fallbackStore.get().medicineSchedules;
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("GET /api/medicine-schedules error:", error);
    const schedules = fallbackStore.get().medicineSchedules;
    return NextResponse.json(schedules);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id;

    if (!id) {
      return NextResponse.json({ error: "Schedule ID (_id) is required" }, { status: 400 });
    }

    const doc = { ...body, _id: id, id, createdAt: body.createdAt || new Date().toISOString() };

    const db = await connectDB();
    if (db) {
      const schedule = new MedicineScheduleModel(doc);
      await schedule.save();
      return NextResponse.json({ ...schedule.toJSON(), id: schedule._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.medicineSchedules.findIndex((s) => (s._id || s.id) === id);
    if (idx !== -1) {
      store.medicineSchedules[idx] = doc;
    } else {
      store.medicineSchedules.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/medicine-schedules error:", error);
    const message = error instanceof Error ? error.message : "Failed to create medicine schedule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
