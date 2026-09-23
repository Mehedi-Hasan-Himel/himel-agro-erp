import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TransactionModel from "@/models/Transaction";
import { fallbackStore } from "@/lib/fallbackStore";
import { syncFinanceSheetToDatabase } from "@/lib/services/googleSheetsSync";

let lastFinanceSyncTime = 0;
let inFlightFinanceSync: Promise<unknown> | null = null;

async function ensureFreshFinanceFromSheet(): Promise<void> {
  const now = Date.now();
  if (now - lastFinanceSyncTime < 4000) {
    return;
  }
  if (!inFlightFinanceSync) {
    inFlightFinanceSync = syncFinanceSheetToDatabase()
      .then(() => {
        lastFinanceSyncTime = Date.now();
      })
      .catch((err) => {
        console.warn("Auto-sync on GET /api/transactions failed:", err);
      })
      .finally(() => {
        inFlightFinanceSync = null;
      });
  }
  await inFlightFinanceSync;
}

export async function GET(request: NextRequest) {
  try {
    await ensureFreshFinanceFromSheet();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const month = searchParams.get("month"); // YYYY-MM
    const category = searchParams.get("category");

    const db = await connectDB();
    if (db) {
      const query: Record<string, unknown> = {};
      if (type && type !== "ALL") {
        query.type = type;
      }
      if (month) {
        query.date = { $regex: `^${month}` };
      }
      if (category && category !== "ALL") {
        query.category = category;
      }
      const transactions = await TransactionModel.find(query).sort({ date: -1 }).lean();
      const result = transactions.map((t) => ({ ...t, id: t._id }));
      return NextResponse.json(result);
    }

    let txns = fallbackStore.get().transactions;
    if (type && type !== "ALL") {
      txns = txns.filter((t) => t.type === type);
    }
    if (month) {
      txns = txns.filter((t) => String(t.date || "").startsWith(month));
    }
    if (category && category !== "ALL") {
      txns = txns.filter((t) => t.category === category);
    }
    return NextResponse.json(txns);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    const txns = fallbackStore.get().transactions;
    return NextResponse.json(txns);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body._id || body.id;

    if (!id) {
      return NextResponse.json({ error: "Transaction ID (_id) is required" }, { status: 400 });
    }

    const doc = { ...body, _id: id, id, createdAt: body.createdAt || new Date().toISOString() };

    const db = await connectDB();
    if (db) {
      const txn = new TransactionModel(doc);
      await txn.save();
      return NextResponse.json({ ...txn.toJSON(), id: txn._id }, { status: 201 });
    }

    const store = fallbackStore.get();
    const idx = store.transactions.findIndex((t) => (t._id || t.id) === id);
    if (idx !== -1) {
      store.transactions[idx] = doc;
    } else {
      store.transactions.unshift(doc);
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/transactions error:", error);
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
