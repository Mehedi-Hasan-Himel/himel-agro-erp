import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";
import { fallbackStore } from "@/lib/fallbackStore";
import { pushPigeonToGoogleSheet, bulkDeletePigeonsFromGoogleSheet } from "@/lib/services/googleSheetsPush";
import { syncGoogleSheetToDatabase } from "@/lib/services/googleSheetsSync";
import fs from "fs";
import path from "path";

let lastPigeonsSyncTime = 0;
let inFlightPigeonsSync: Promise<unknown> | null = null;

async function ensureFreshFromSheet(): Promise<void> {
  const now = Date.now();
  if (now - lastPigeonsSyncTime < 4000) {
    return;
  }
  if (!inFlightPigeonsSync) {
    inFlightPigeonsSync = syncGoogleSheetToDatabase()
      .then(() => {
        lastPigeonsSyncTime = Date.now();
      })
      .catch((err) => {
        console.warn("Auto-sync on GET /api/pigeons failed:", err);
      })
      .finally(() => {
        inFlightPigeonsSync = null;
      });
  }
  await inFlightPigeonsSync;
}

function normalizePigeon(p: any) {
  if (!p) return p;
  const breed = p.breed === "Giribaz / Local" ? "Giribaz" : (p.breed || "Giribaz");
  const breedInitial = breed.trim().charAt(0).toUpperCase() || "G";
  const serialStr = String(p.ringSerial || 1).padStart(2, "0");
  const subtypeInitial = (p.breedSubtype || "Standard").trim().charAt(0).toUpperCase() || "S";
  const sUpper = String(p.sex || "").toUpperCase();
  const genderInitial =
    sUpper === "MALE" || sUpper === "M"
      ? "M"
      : sUpper === "FEMALE" || sUpper === "F"
      ? "F"
      : "U";
  const canonicalId = `${p.ringYear || 2026}-${serialStr}-${breedInitial}${subtypeInitial}${genderInitial}`;
  const officialRingNumber = p.officialRingNumber || `${serialStr}--${p.ringYear || 2026}`;
  return { ...p, officialRingNumber, breed, id: canonicalId, _id: canonicalId };
}

export async function GET() {
  try {
    await ensureFreshFromSheet();

    const db = await connectDB();
    if (db) {
      const pigeons = await PigeonModel.find({}).sort({ createdAt: -1 }).lean();
      const result = pigeons.map(normalizePigeon);
      return NextResponse.json(result);
    }

    const pigeons = fallbackStore.get().pigeons;
    return NextResponse.json(pigeons.map(normalizePigeon));
  } catch (error) {
    console.error("GET /api/pigeons error:", error);
    const pigeons = fallbackStore.get().pigeons;
    return NextResponse.json(pigeons.map(normalizePigeon));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id;

    if (!id) {
      return NextResponse.json({ error: "Pigeon ID (_id) is required" }, { status: 400 });
    }

    const serialStr = String(body.ringSerial || 1).padStart(2, "0");
    const year = body.ringYear || 2026;
    const officialRingNumber = body.officialRingNumber || `${serialStr}--${year}`;
    const doc = {
      ...body,
      officialRingNumber,
      ringYear: year,
      ringSerial: body.ringSerial || 1,
      _id: id,
      id,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // 1. Push newly registered pigeon to Google Sheet Webhook (if configured)
    let sheetSyncResult = null;
    try {
      sheetSyncResult = await pushPigeonToGoogleSheet(doc);
    } catch (pushErr) {
      console.warn("Could not push new pigeon to Google Sheet:", pushErr);
    }

    // 2. Persist to MongoDB or Fallback Store
    const db = await connectDB();
    if (db) {
      const pigeon = new PigeonModel(doc);
      await pigeon.save();
    }

    const store = fallbackStore.get();
    const idx = store.pigeons.findIndex((p) => (p._id || p.id) === id);
    if (idx !== -1) {
      store.pigeons[idx] = doc;
    } else {
      store.pigeons.unshift(doc);
    }

    // Persist snapshot to data/pigeons.json
    try {
      const filePath = path.join(process.cwd(), "data", "pigeons.json");
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(store.pigeons, null, 2), "utf-8");
      }
    } catch (fsErr) {
      console.warn("Could not persist to data/pigeons.json:", fsErr);
    }

    return NextResponse.json({ ...doc, sheetSync: sheetSyncResult }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/pigeons error:", error);
    const message = error instanceof Error ? error.message : "Failed to create pigeon";
    const status = (error as { code?: number })?.code === 11000 ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] = body.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Please provide an array of pigeon IDs to delete." }, { status: 400 });
    }

    let dbDeletedCount = 0;
    const dbRingNumbers: string[] = [];
    const db = await connectDB();

    if (db) {
      const existing = await PigeonModel.find({ _id: { $in: ids } })
        .select("officialRingNumber ringSerial ringYear")
        .lean();
      existing.forEach((p: any) => {
        const ring =
          p.officialRingNumber ||
          `${String(p.ringSerial || 1).padStart(2, "0")}--${p.ringYear || 2026}`;
        dbRingNumbers.push(ring);
      });

      const result = await PigeonModel.deleteMany({ _id: { $in: ids } });
      dbDeletedCount = result.deletedCount || 0;

      // End active pairs in DB
      try {
        const PairModel = (await import("@/models/Pair")).default;
        await PairModel.updateMany(
          {
            status: "ACTIVE",
            $or: [{ maleId: { $in: ids } }, { femaleId: { $in: ids } }],
          },
          {
            $set: {
              status: "ENDED",
              endDate: new Date().toISOString().split("T")[0],
            },
          }
        );
      } catch (pairErr) {
        console.warn("Could not end active pairs in DB:", pairErr);
      }
    }

    const store = fallbackStore.get();
    const idSet = new Set(ids);
    const toDelete = store.pigeons.filter((p: any) =>
      idSet.has(String(p._id || p.id))
    );
    const ringNumbers = toDelete.map(
      (p: any) =>
        p.officialRingNumber ||
        `${String(p.ringSerial || 1).padStart(2, "0")}--${p.ringYear || 2026}`
    );

    const initialCount = store.pigeons.length;
    store.pigeons = store.pigeons.filter((p) => !idSet.has(String(p._id || p.id)));
    const deletedCount = initialCount - store.pigeons.length;

    // Persist snapshot to data/pigeons.json
    try {
      const filePath = path.join(process.cwd(), "data", "pigeons.json");
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(store.pigeons, null, 2), "utf-8");
      }
    } catch (fsErr) {
      console.warn("Could not persist to data/pigeons.json:", fsErr);
    }

    const allRingNumbers = Array.from(new Set([...ringNumbers, ...dbRingNumbers]));
    if (allRingNumbers.length > 0) {
      bulkDeletePigeonsFromGoogleSheet(allRingNumbers).catch((e) =>
        console.warn("Could not bulk delete from sheet:", e)
      );
    }

    // Also update any active pairs that contain any of the deleted pigeons
    store.pairs = store.pairs.map((pair) => {
      const maleId = String(pair.maleId || "");
      const femaleId = String(pair.femaleId || "");
      if ((idSet.has(maleId) || idSet.has(femaleId)) && pair.status === "ACTIVE") {
        return { ...pair, status: "ENDED", endDate: new Date().toISOString().split("T")[0] };
      }
      return pair;
    });

    const finalDeletedCount = Math.max(deletedCount, dbDeletedCount);
    return NextResponse.json({
      success: true,
      deletedCount: finalDeletedCount,
      message: `Successfully deleted ${finalDeletedCount} pigeons.`,
    });
  } catch (error) {
    console.error("DELETE /api/pigeons bulk error:", error);
    return NextResponse.json({ error: "Failed to perform bulk pigeon deletion" }, { status: 500 });
  }
}
