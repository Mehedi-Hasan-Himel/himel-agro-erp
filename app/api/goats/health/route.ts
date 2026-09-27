import { NextRequest, NextResponse } from "next/server";
import { fallbackStore } from "@/lib/fallbackStore";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const store = fallbackStore.get();
    const records = store.goatHealth || [];
    return NextResponse.json(records);
  } catch (error: unknown) {
    console.error("GET /api/goats/health error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || `gt_hl_${Date.now()}`;
    const now = new Date().toISOString();

    const record = {
      ...body,
      id,
      createdAt: body.createdAt || now,
    };

    const store = fallbackStore.get();
    if (!store.goatHealth) store.goatHealth = [];
    store.goatHealth.unshift(record);

    try {
      const filePath = path.join(process.cwd(), "data", "goatHealth.json");
      fs.writeFileSync(filePath, JSON.stringify(store.goatHealth, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not persist goat health to disk:", e);
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/goats/health error:", error);
    const message = error instanceof Error ? error.message : "Failed to save health record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
