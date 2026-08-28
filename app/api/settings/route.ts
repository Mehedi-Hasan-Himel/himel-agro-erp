import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AppConfigModel from "@/models/AppConfig";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const doc = await AppConfigModel.findById("SETTINGS").lean();
      if (doc?.data) {
        return NextResponse.json(doc.data);
      }
    }

    return NextResponse.json(fallbackStore.get().settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(fallbackStore.get().settings);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const db = await connectDB();
    if (db) {
      const doc = await AppConfigModel.findByIdAndUpdate(
        "SETTINGS",
        { $set: { data: body } },
        { new: true, upsert: true }
      ).lean();
      return NextResponse.json(doc?.data ?? body);
    }

    fallbackStore.set({ settings: body });
    return NextResponse.json(body);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
