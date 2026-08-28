import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AppConfigModel from "@/models/AppConfig";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const doc = await AppConfigModel.findById("BREEDS").lean();
      if (doc?.data) {
        return NextResponse.json(doc.data);
      }
    }

    return NextResponse.json(fallbackStore.get().breeds);
  } catch (error) {
    console.error("GET /api/breeds error:", error);
    return NextResponse.json(fallbackStore.get().breeds);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const db = await connectDB();
    if (db) {
      const doc = await AppConfigModel.findByIdAndUpdate(
        "BREEDS",
        { $set: { data: body } },
        { new: true, upsert: true }
      ).lean();
      return NextResponse.json(doc?.data ?? body);
    }

    fallbackStore.set({ breeds: body });
    return NextResponse.json(body);
  } catch (error) {
    console.error("PUT /api/breeds error:", error);
    return NextResponse.json({ error: "Failed to update breeds" }, { status: 500 });
  }
}
