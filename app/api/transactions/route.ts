import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TransactionModel from "@/models/Transaction";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const month = searchParams.get("month"); // YYYY-MM
    const category = searchParams.get("category");

    const query: Record<string, unknown> = {};

    if (type && type !== "ALL") {
      query.type = type;
    }
    if (month) {
      // Match transactions where date starts with YYYY-MM
      query.date = { $regex: `^${month}` };
    }
    if (category && category !== "ALL") {
      query.category = category;
    }

    const transactions = await TransactionModel.find(query).sort({ date: -1 }).lean();
    const result = transactions.map((t) => ({ ...t, id: t._id }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json({ error: "Transaction ID (_id) is required" }, { status: 400 });
    }

    const txn = new TransactionModel(body);
    await txn.save();

    return NextResponse.json({ ...txn.toJSON(), id: txn._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/transactions error:", error);
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
