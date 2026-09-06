import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";
import { fallbackStore } from "@/lib/fallbackStore";

function normalizePigeon(p: any) {
  if (!p) return p;
  const breed = p.breed === "Giribaz / Local" ? "Giribaz" : (p.breed || "Giribaz");
  const breedInitial = breed.trim().charAt(0).toUpperCase() || "G";
  const serialStr = String(p.ringSerial || 1).padStart(2, "0");
  const canonicalId = `${p.ringYear || 2026}-${serialStr}-${breedInitial}`;
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
            { _id: new RegExp(`^${cleanId}(-[a-z])?$`, "i") },
            { id: new RegExp(`^${cleanId}(-[a-z])?$`, "i") },
          ],
        }).lean();
      }

      if (!pigeon) {
        return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
      }
      return NextResponse.json(normalizePigeon(pigeon));
    }

    const pigeons = fallbackStore.get().pigeons;
    let found = pigeons.find((p: any) => (p._id || p.id)?.toLowerCase() === cleanId);
    if (!found) {
      found = pigeons.find(
        (p: any) =>
          (p._id || p.id)?.toLowerCase().startsWith(cleanId + "-") ||
          cleanId.startsWith((p._id || p.id)?.toLowerCase() + "-")
      );
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
            { _id: new RegExp(`^${cleanId}(-[a-z])?$`, "i") },
            { id: new RegExp(`^${cleanId}(-[a-z])?$`, "i") },
          ],
        }).lean();
      }

      if (!existingDoc) {
        return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
      }

      const currentActualId = String(existingDoc._id);
      const targetId = newId || currentActualId;

      if (targetId !== currentActualId) {
        await PigeonModel.findByIdAndDelete(currentActualId);
        const created = await PigeonModel.create({ ...existingDoc, ...body, _id: targetId });
        return NextResponse.json(normalizePigeon({ ...created.toObject(), id: targetId }));
      }

      const updated = await PigeonModel.findByIdAndUpdate(
        currentActualId,
        { $set: body },
        { new: true, runValidators: true }
      ).lean();

      return NextResponse.json(normalizePigeon(updated));
    }

    const store = fallbackStore.get();
    const pigeons = store.pigeons;
    let idx = pigeons.findIndex((p: any) => (p._id || p.id)?.toLowerCase() === cleanId);
    if (idx === -1) {
      idx = pigeons.findIndex(
        (p: any) =>
          (p._id || p.id)?.toLowerCase().startsWith(cleanId + "-") ||
          cleanId.startsWith((p._id || p.id)?.toLowerCase() + "-")
      );
    }

    if (idx === -1) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }

    const targetId = newId || (pigeons[idx]._id || pigeons[idx].id);
    pigeons[idx] = { ...pigeons[idx], ...body, id: targetId, _id: targetId };
    return NextResponse.json(normalizePigeon(pigeons[idx]));
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
    if (db) {
      let deleted = await PigeonModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        deleted = await PigeonModel.findOneAndDelete({
          $or: [
            { _id: new RegExp(`^${cleanId}(-[a-z])?$`, "i") },
            { id: new RegExp(`^${cleanId}(-[a-z])?$`, "i") },
          ],
        }).lean();
      }

      if (!deleted) {
        return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: `Pigeon ${id} deleted permanently.` });
    }

    const store = fallbackStore.get();
    let idx = store.pigeons.findIndex(
      (p: any) => String(p._id || p.id || "").toLowerCase() === cleanId
    );
    if (idx === -1) {
      idx = store.pigeons.findIndex(
        (p: any) =>
          String(p._id || p.id || "").toLowerCase().startsWith(cleanId + "-") ||
          cleanId.startsWith(String(p._id || p.id || "").toLowerCase() + "-")
      );
    }

    if (idx === -1) {
      return NextResponse.json({ error: "Pigeon not found" }, { status: 404 });
    }

    const targetPigeon = store.pigeons[idx];
    const targetActualId = String((targetPigeon as any)._id || (targetPigeon as any).id || "");
    store.pigeons.splice(idx, 1);

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

    return NextResponse.json({ success: true, message: `Pigeon ${id} deleted permanently.` });
  } catch (error) {
    console.error("DELETE /api/pigeons/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete pigeon" }, { status: 500 });
  }
}
