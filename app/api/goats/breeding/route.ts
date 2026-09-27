import { NextRequest, NextResponse } from "next/server";
import { fallbackStore } from "@/lib/fallbackStore";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const store = fallbackStore.get();
    const records = store.goatBreeding || [];
    return NextResponse.json(records);
  } catch (error: unknown) {
    console.error("GET /api/goats/breeding error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || `gt_br_${Date.now()}`;
    const now = new Date().toISOString();

    const record = {
      ...body,
      id,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    const store = fallbackStore.get();
    if (!store.goatBreeding) store.goatBreeding = [];
    store.goatBreeding.unshift(record);

    try {
      const filePath = path.join(process.cwd(), "data", "goatBreeding.json");
      fs.writeFileSync(filePath, JSON.stringify(store.goatBreeding, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not persist goat breeding to disk:", e);
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/goats/breeding error:", error);
    const message = error instanceof Error ? error.message : "Failed to save breeding record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
