import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { fallbackStore } from "@/lib/fallbackStore";
import PigeonModel from "@/models/Pigeon";
import PairModel from "@/models/Pair";
import BreedingRoundModel from "@/models/BreedingRound";
import FeedPurchaseModel from "@/models/FeedPurchase";
import FeedUsageModel from "@/models/FeedUsage";
import MedicineScheduleModel from "@/models/MedicineSchedule";
import TransactionModel from "@/models/Transaction";
import { calculatePigeonStats } from "@/lib/calculations/pigeonStats";
import { Pigeon } from "@/types/pigeon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isConnected = await connectDB();

    if (isConnected) {
      const [
        pigeonsDoc,
        pairsDoc,
        roundsDoc,
        purchasesDoc,
        usagesDoc,
        medsDoc,
        txnsDoc,
      ] = await Promise.all([
        PigeonModel.find({}).lean(),
        PairModel.find({}).lean(),
        BreedingRoundModel.find({}).lean(),
        FeedPurchaseModel.find({}).lean(),
        FeedUsageModel.find({}).lean(),
        MedicineScheduleModel.find({}).lean(),
        TransactionModel.find({}).sort({ date: -1 }).limit(100).lean(),
      ]);

      const pigeons = pigeonsDoc.map((d: any) => ({ ...d, id: d._id || d.id })) as Pigeon[];
      const pairs = pairsDoc.map((d: any) => ({ ...d, id: d._id || d.id }));
      const rounds = roundsDoc.map((d: any) => ({ ...d, id: d._id || d.id }));
      const purchases = purchasesDoc.map((d: any) => ({ ...d, id: d._id || d.id }));
      const usages = usagesDoc.map((d: any) => ({ ...d, id: d._id || d.id }));
      const meds = medsDoc.map((d: any) => ({ ...d, id: d._id || d.id }));
      const txns = txnsDoc.map((d: any) => ({ ...d, id: d._id || d.id }));

      return NextResponse.json({
        pigeons,
        stats: calculatePigeonStats(pigeons),
        pairs,
        rounds,
        feedPurchases: purchases,
        feedUsages: usages,
        medicineSchedules: meds,
        transactions: txns,
      });
    }

    // Fallback store
    const store = fallbackStore.get();
    const pigeons = (store.pigeons || []).map((p: any) => ({ ...p, id: p._id || p.id })) as Pigeon[];
    const pairs = (store.pairs || []).map((p: any) => ({ ...p, id: p._id || p.id }));
    const rounds = (store.breedingRounds || []).map((p: any) => ({ ...p, id: p._id || p.id }));
    const purchases = (store.feedPurchases || []).map((p: any) => ({ ...p, id: p._id || p.id }));
    const usages = (store.feedUsage || []).map((p: any) => ({ ...p, id: p._id || p.id }));
    const meds = (store.medicineSchedules || []).map((p: any) => ({ ...p, id: p._id || p.id }));
    const txns = (store.transactions || []).map((p: any) => ({ ...p, id: p._id || p.id }));

    return NextResponse.json({
      pigeons,
      stats: calculatePigeonStats(pigeons),
      pairs,
      rounds,
      feedPurchases: purchases,
      feedUsages: usages,
      medicineSchedules: meds,
      transactions: txns,
    });
  } catch (error: unknown) {
    console.error("Dashboard API error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
