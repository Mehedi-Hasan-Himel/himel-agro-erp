import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AppConfigModel from "@/models/AppConfig";
import breedsSeed from "@/data/breeds.json";

const DEFAULT_BREEDS = breedsSeed;

export async function GET() {
  try {
    await connectDB();
    const doc = await AppConfigModel.findById("BREEDS").lean();

    if (!doc) {
      return NextResponse.json(DEFAULT_BREEDS);
    }

    return NextResponse.json(doc.data);
  } catch (error) {
    console.error("GET /api/breeds error:", error);
    return NextResponse.json({ error: "Failed to fetch breeds" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const doc = await AppConfigModel.findByIdAndUpdate(
      "BREEDS",
      { $set: { data: body } },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json(doc?.data ?? body);
  } catch (error) {
    console.error("PUT /api/breeds error:", error);
    return NextResponse.json({ error: "Failed to update breeds" }, { status: 500 });
  }
}
