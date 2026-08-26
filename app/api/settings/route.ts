import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AppConfigModel from "@/models/AppConfig";
import settingsSeed from "@/data/settings.json";

const DEFAULT_SETTINGS = settingsSeed;

export async function GET() {
  try {
    await connectDB();
    const doc = await AppConfigModel.findById("SETTINGS").lean();

    if (!doc) {
      // Return default settings if not yet seeded
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(doc.data);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const doc = await AppConfigModel.findByIdAndUpdate(
      "SETTINGS",
      { $set: { data: body } },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json(doc?.data ?? body);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
