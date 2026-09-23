import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";
import { fallbackStore } from "@/lib/fallbackStore";
import { pushPigeonToGoogleSheet, deletePigeonFromGoogleSheet } from "@/lib/services/googleSheetsPush";
import { syncGoogleSheetToDatabase } from "@/lib/services/googleSheetsSync";
import fs from "fs";
import path from "path";

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
  return { ...p, breed, id: canonicalId, _id: canonicalId };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.trim().toLowerCase();
    const db = await connectDB();
    if (db) {
      let pigeon = await PigeonModel.findById(id).lean();
      if (!pigeon) {
        pigeon = await PigeonModel.findOne({
          $or: [
            { _id: new RegExp(`^${cleanId}(-[a-z]+)?$`, "i") },
            { id: new RegExp(`^${cleanId}(-[a-z]+)?$`, "i") },
          ],
        }).lean();
      }

      if (!pigeon) {
        const parts = cleanId.split("-");
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const s = parseInt(parts[1], 10);
          if (!isNaN(y) && !isNaN(s)) {
            pigeon = await PigeonModel.findOne({ ringYear: y, ringSerial: s }).lean();
          }
        }
      }

      if (!pigeon) {
        try {
          await syncGoogleSheetToDatabase();
          pigeon = await PigeonModel.findById(id).lean();
          if (!pigeon) {
            pigeon = await PigeonModel.findOne({
              $or: [
                { _id: new RegExp(`^${cleanId}(-[a-z]+)?$`, "i") },
                { id: new RegExp(`^${cleanId}(-[a-z]+)?$`, "i") },
              ],
            }).lean();
          }
        } catch {
          // ignore
        }
      }

      if (!pigeon) {
        return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
      }
      return NextResponse.json(normalizePigeon(pigeon));
    }

    const pigeons = fallbackStore.get().pigeons;
    let found = pigeons.find((p: any) => {
      const norm = normalizePigeon(p);
      return (
        (norm._id || norm.id)?.toLowerCase() === cleanId ||
        (p._id || p.id)?.toLowerCase() === cleanId
      );
    });

    if (!found) {
      found = pigeons.find((p: any) => {
        const norm = normalizePigeon(p);
        const nId = (norm._id || norm.id)?.toLowerCase() || "";
        const pId = (p._id || p.id)?.toLowerCase() || "";
        return (
          nId.startsWith(cleanId) ||
          cleanId.startsWith(nId) ||
          pId.startsWith(cleanId) ||
          cleanId.startsWith(pId)
        );
      });
    }

    if (!found) {
      const parts = cleanId.split("-");
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const s = parseInt(parts[1], 10);
        if (!isNaN(y) && !isNaN(s)) {
          found = pigeons.find((p: any) => p.ringYear === y && p.ringSerial === s);
        }
      }
    }

    if (!found) {
      try {
        await syncGoogleSheetToDatabase();
        const fresh = fallbackStore.get().pigeons;
        found = fresh.find((p: any) => {
          const norm = normalizePigeon(p);
          return (
            (norm._id || norm.id)?.toLowerCase() === cleanId ||
            (p._id || p.id)?.toLowerCase() === cleanId
          );
        });
      } catch {
        // ignore
      }
    }

    if (!found) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }
    return NextResponse.json(normalizePigeon(found));
  } catch (error) {
    console.error("GET /api/pigeons/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch pigeon" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.trim().toLowerCase();
    const body = await request.json();

    const newId = body.newId || body.id;
    delete body._id;
    delete body.id;
    delete body.newId;

    const db = await connectDB();
    if (db) {
      let existingDoc = await PigeonModel.findById(id).lean();
      if (!existingDoc) {
        existingDoc = await PigeonModel.findOne({
          $or: [
            { _id: new RegExp(`^${cleanId}(-[a-z]+)?$`, "i") },
            { id: new RegExp(`^${cleanId}(-[a-z]+)?$`, "i") },
          ],
        }).lean();
      }

      if (!existingDoc) {
        const parts = cleanId.split("-");
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const s = parseInt(parts[1], 10);
          if (!isNaN(y) && !isNaN(s)) {
            existingDoc = await PigeonModel.findOne({ ringYear: y, ringSerial: s }).lean();
          }
        }
      }

      if (!existingDoc) {
        return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
      }

      const currentActualId = String(existingDoc._id);
      const targetId = newId || currentActualId;

      if (targetId !== currentActualId) {
        await PigeonModel.findByIdAndDelete(currentActualId);
        await PigeonModel.create({ ...existingDoc, ...body, _id: targetId });
      } else {
        await PigeonModel.findByIdAndUpdate(
          currentActualId,
          { $set: body },
          { new: true, runValidators: true }
        );
      }
    }

    const store = fallbackStore.get();
    const pigeons = store.pigeons;
    let idx = pigeons.findIndex((p: any) => {
      const norm = normalizePigeon(p);
      return (
        (norm._id || norm.id)?.toLowerCase() === cleanId ||
        (p._id || p.id)?.toLowerCase() === cleanId
      );
    });

    if (idx === -1) {
      idx = pigeons.findIndex((p: any) => {
        const norm = normalizePigeon(p);
        const nId = (norm._id || norm.id)?.toLowerCase() || "";
        const pId = (p._id || p.id)?.toLowerCase() || "";
        return (
          nId.startsWith(cleanId) ||
          cleanId.startsWith(nId) ||
          pId.startsWith(cleanId) ||
          cleanId.startsWith(pId)
        );
      });
    }

    if (idx === -1) {
      const parts = cleanId.split("-");
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const s = parseInt(parts[1], 10);
        if (!isNaN(y) && !isNaN(s)) {
          idx = pigeons.findIndex((p: any) => p.ringYear === y && p.ringSerial === s);
        }
      }
    }

    if (idx === -1) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }

    const targetId = newId || (pigeons[idx]._id || pigeons[idx].id);
    pigeons[idx] = { ...pigeons[idx], ...body, id: targetId, _id: targetId };
    const resultDoc = normalizePigeon(pigeons[idx]);

    // Persist snapshot to data/pigeons.json
    try {
      const filePath = path.join(process.cwd(), "data", "pigeons.json");
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(pigeons, null, 2), "utf-8");
      }
    } catch (fsErr) {
      console.warn("Could not persist to data/pigeons.json:", fsErr);
    }

    pushPigeonToGoogleSheet(resultDoc).catch((e) =>
      console.warn("Could not push updated pigeon to sheet:", e)
    );

    return NextResponse.json(resultDoc);
  } catch (error) {
    console.error("PUT /api/pigeons/[id] error:", error);
    return NextResponse.json({ error: "Failed to update pigeon" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.trim().toLowerCase();
    const db = await connectDB();
    let deletedRingNumber: string | null = null;
    let targetActualId: string = id;

    if (db) {
      let deleted = await PigeonModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        deleted = await PigeonModel.findOneAndDelete({
          $or: [
            { _id: new RegExp(`^${cleanId}(-[a-z]+)?$`, "i") },
            { id: new RegExp(`^${cleanId}(-[a-z]+)?$`, "i") },
          ],
        }).lean();
      }

      if (!deleted) {
        const parts = cleanId.split("-");
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const s = parseInt(parts[1], 10);
          if (!isNaN(y) && !isNaN(s)) {
            deleted = await PigeonModel.findOneAndDelete({ ringYear: y, ringSerial: s }).lean();
          }
        }
      }

      if (deleted) {
        targetActualId = String((deleted as any)._id || (deleted as any).id || id);
        deletedRingNumber =
          (deleted as any).officialRingNumber ||
          `${String((deleted as any).ringSerial || 1).padStart(2, "0")}--${(deleted as any).ringYear || 2026}`;

        // Also end active pairs in DB
        try {
          const PairModel = (await import("@/models/Pair")).default;
          await PairModel.updateMany(
            {
              status: "ACTIVE",
              $or: [{ maleId: targetActualId }, { femaleId: targetActualId }],
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
    }

    const store = fallbackStore.get();
    let idx = store.pigeons.findIndex(
      (p: any) => {
        const norm = normalizePigeon(p);
        return (
          (norm._id || norm.id)?.toLowerCase() === cleanId ||
          (p._id || p.id)?.toLowerCase() === cleanId
        );
      }
    );
    if (idx === -1) {
      idx = store.pigeons.findIndex((p: any) => {
        const norm = normalizePigeon(p);
        const nId = (norm._id || norm.id)?.toLowerCase() || "";
        const pId = (p._id || p.id)?.toLowerCase() || "";
        return (
          nId.startsWith(cleanId) ||
          cleanId.startsWith(nId) ||
          pId.startsWith(cleanId) ||
          cleanId.startsWith(pId)
        );
      });
    }

    if (idx === -1) {
      const parts = cleanId.split("-");
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const s = parseInt(parts[1], 10);
        if (!isNaN(y) && !isNaN(s)) {
          idx = store.pigeons.findIndex((p: any) => p.ringYear === y && p.ringSerial === s);
        }
      }
    }

    if (idx === -1) {
      if (deletedRingNumber) {
        deletePigeonFromGoogleSheet(deletedRingNumber).catch((e) =>
          console.warn("Could not delete pigeon from sheet:", e)
        );
        return NextResponse.json({ success: true, message: `Pigeon ${id} deleted permanently.` });
      }
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }

    const targetPigeon = store.pigeons[idx];
    const pigeonActualId = String((targetPigeon as any)._id || (targetPigeon as any).id || targetActualId);
    const ringNumber =
      deletedRingNumber ||
      (targetPigeon as any).officialRingNumber ||
      `${String((targetPigeon as any).ringSerial || 1).padStart(2, "0")}--${(targetPigeon as any).ringYear || 2026}`;

    store.pigeons.splice(idx, 1);

    // Persist snapshot to data/pigeons.json
    try {
      const filePath = path.join(process.cwd(), "data", "pigeons.json");
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(store.pigeons, null, 2), "utf-8");
      }
    } catch (fsErr) {
      console.warn("Could not persist to data/pigeons.json:", fsErr);
    }

    // Also end any active pairs containing this pigeon
    store.pairs = store.pairs.map((pair: any) => {
      const maleId = String(pair.maleId || "");
      const femaleId = String(pair.femaleId || "");
      const maleMatch =
        maleId === id ||
        maleId === targetActualId ||
        (maleId && cleanId.startsWith(maleId.toLowerCase()));
      const femaleMatch =
        femaleId === id ||
        femaleId === targetActualId ||
        (femaleId && cleanId.startsWith(femaleId.toLowerCase()));
      if ((maleMatch || femaleMatch) && pair.status === "ACTIVE") {
        return { ...pair, status: "ENDED", endDate: new Date().toISOString().split("T")[0] };
      }
      return pair;
    });

    deletePigeonFromGoogleSheet(ringNumber).catch((e) =>
      console.warn("Could not delete pigeon from sheet:", e)
    );

    return NextResponse.json({ success: true, message: `Pigeon ${id} deleted permanently.` });
  } catch (error) {
    console.error("DELETE /api/pigeons/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete pigeon" }, { status: 500 });
  }
}
