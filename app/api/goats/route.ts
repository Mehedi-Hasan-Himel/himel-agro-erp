import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import GoatModel from "@/models/Goat";
import { fallbackStore } from "@/lib/fallbackStore";
import fs from "fs";
import path from "path";

import goatsSeed from "@/data/goats.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sex = searchParams.get("sex");
    const breed = searchParams.get("breed");
    const search = searchParams.get("search")?.toLowerCase();

    const db = await connectDB();
    if (db) {
      const count = await GoatModel.countDocuments();
      if (count === 0) {
        try {
          const docs = (goatsSeed as Record<string, unknown>[]).map((g) => ({
            ...g,
            _id: g.id || g._id,
            id: g.id || g._id,
            createdAt: g.createdAt || new Date().toISOString(),
            updatedAt: g.updatedAt || new Date().toISOString(),
          }));
          await GoatModel.insertMany(docs);
        } catch (seedErr) {
          console.warn("Failed to auto-seed goats into MongoDB:", seedErr);
        }
      }

      const query: Record<string, unknown> = {};
      if (status && status !== "ALL") query.status = status;
      if (sex && sex !== "ALL") query.sex = sex;
      if (breed && breed !== "ALL") query.breed = breed;
      if (search) {
        query.$or = [
          { tagNumber: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { breed: { $regex: search, $options: "i" } },
          { color: { $regex: search, $options: "i" } },
        ];
      }

      const goats = await GoatModel.find(query).sort({ tagNumber: 1 }).lean();
      const result = goats.map((g) => ({ ...g, id: g._id }));
      return NextResponse.json(result);
    }

    let goats = (fallbackStore.get().goats || []) as Record<string, unknown>[];
    if (status && status !== "ALL") {
      goats = goats.filter((g) => g.status === status);
    }
    if (sex && sex !== "ALL") {
      goats = goats.filter((g) => g.sex === sex);
    }
    if (breed && breed !== "ALL") {
      goats = goats.filter((g) => g.breed === breed);
    }
    if (search) {
      goats = goats.filter((g) => {
        const tag = String(g.tagNumber || "").toLowerCase();
        const name = String(g.name || "").toLowerCase();
        const b = String(g.breed || "").toLowerCase();
        const c = String(g.color || "").toLowerCase();
        return tag.includes(search) || name.includes(search) || b.includes(search) || c.includes(search);
      });
    }

    return NextResponse.json(goats);
  } catch (error) {
    console.error("GET /api/goats error:", error);
    const goats = fallbackStore.get().goats || [];
    return NextResponse.json(goats);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id || `goat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const doc = {
      ...body,
      _id: id,
      id,
      sectorId: "GOAT",
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    const db = await connectDB();
    if (db) {
      const goat = new GoatModel(doc);
      await goat.save();
      return NextResponse.json({ ...goat.toJSON(), id: goat._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    if (!store.goats) store.goats = [];
    const idx = store.goats.findIndex((g) => (g._id || g.id) === id);
    if (idx !== -1) {
      store.goats[idx] = doc;
    } else {
      store.goats.push(doc);
    }

    try {
      const filePath = path.join(process.cwd(), "data", "goats.json");
      fs.writeFileSync(filePath, JSON.stringify(store.goats, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not persist goats to disk:", e);
    }

    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/goats error:", error);
    const message = error instanceof Error ? error.message : "Failed to create goat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
