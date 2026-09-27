import { NextResponse } from "next/server";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const store = fallbackStore.get();
    const stock = store.goatFeed || [];
    return NextResponse.json(stock);
  } catch (error: unknown) {
    console.error("GET /api/goats/feed error:", error);
    return NextResponse.json([]);
  }
}
