import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PigeonModel from "@/models/Pigeon";
import PairModel from "@/models/Pair";
import BreedingRoundModel from "@/models/BreedingRound";
import FlyingRecordModel from "@/models/FlyingRecord";
import HealthRecordModel from "@/models/HealthRecord";
import MedicineScheduleModel from "@/models/MedicineSchedule";
import FeedPurchaseModel from "@/models/FeedPurchase";
import FeedUsageModel from "@/models/FeedUsage";
import TransactionModel from "@/models/Transaction";
import AppConfigModel from "@/models/AppConfig";

import pigeonsSeed from "@/data/pigeons.json";
import pairsSeed from "@/data/pairs.json";
import breedingRoundsSeed from "@/data/breedingRounds.json";
import flyingRecordsSeed from "@/data/flyingRecords.json";
import healthRecordsSeed from "@/data/healthRecords.json";
import medicineSchedulesSeed from "@/data/medicineSchedules.json";
import feedPurchasesSeed from "@/data/feedPurchases.json";
import feedUsageSeed from "@/data/feedUsage.json";
import transactionsSeed from "@/data/transactions.json";
import breedsSeed from "@/data/breeds.json";
import settingsSeed from "@/data/settings.json";

// POST /api/seed — seeds the database from JSON files
// GET /api/seed — exports all data as JSON dump
// POST /api/seed?reset=true — resets to seed data

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const isReset = searchParams.get("reset") === "true";

    let pigeons = pigeonsSeed as unknown[];
    let pairs = pairsSeed as unknown[];
    let breedingRounds = breedingRoundsSeed as unknown[];
    let flyingRecords = flyingRecordsSeed as unknown[];
    let healthRecords = healthRecordsSeed as unknown[];
    let medicineSchedules = medicineSchedulesSeed as unknown[];
    let feedPurchases = feedPurchasesSeed as unknown[];
    let feedUsage = feedUsageSeed as unknown[];
    let transactions = transactionsSeed as unknown[];
    let breeds: unknown = breedsSeed;
    let settings: unknown = settingsSeed;

    // If importing user-provided data (not a reset), read from request body
    if (!isReset) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.json();
        if (body.pigeons) pigeons = body.pigeons;
        if (body.pairs) pairs = body.pairs;
        if (body.breeding_rounds || body.breedingRounds)
          breedingRounds = body.breeding_rounds || body.breedingRounds;
        if (body.flying_records || body.flyingRecords)
          flyingRecords = body.flying_records || body.flyingRecords;
        if (body.health_records || body.healthRecords)
          healthRecords = body.health_records || body.healthRecords;
        if (body.medicine_schedules || body.medicineSchedules)
          medicineSchedules = body.medicine_schedules || body.medicineSchedules;
        if (body.feed_purchases || body.feedPurchases)
          feedPurchases = body.feed_purchases || body.feedPurchases;
        if (body.feed_usage || body.feedUsage)
          feedUsage = body.feed_usage || body.feedUsage;
        if (body.transactions) transactions = body.transactions;
        if (body.breeds) breeds = body.breeds;
        if (body.settings) settings = body.settings;
      }
    }

    // Helper: upsert array of docs by _id
    async function upsertMany(
      Model: { findByIdAndUpdate: Function },
      docs: unknown[]
    ) {
      const ops = (docs as Record<string, unknown>[]).map((doc) =>
        Model.findByIdAndUpdate(
          doc._id || doc.id,
          { $set: { ...doc, _id: (doc._id || doc.id) as string } },
          { upsert: true, new: true }
        )
      );
      await Promise.all(ops);
    }

    await upsertMany(PigeonModel, pigeons);
    await upsertMany(PairModel, pairs);
    await upsertMany(BreedingRoundModel, breedingRounds);
    await upsertMany(FlyingRecordModel, flyingRecords);
    await upsertMany(HealthRecordModel, healthRecords);
    await upsertMany(MedicineScheduleModel, medicineSchedules);
    await upsertMany(FeedPurchaseModel, feedPurchases);
    await upsertMany(FeedUsageModel, feedUsage);
    await upsertMany(TransactionModel, transactions);

    // Upsert settings and breeds as AppConfig docs
    await AppConfigModel.findByIdAndUpdate(
      "SETTINGS",
      { $set: { data: settings } },
      { upsert: true, new: true }
    );
    await AppConfigModel.findByIdAndUpdate(
      "BREEDS",
      { $set: { data: breeds } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: isReset ? "Database reset to seed data." : "Data imported successfully.",
      counts: {
        pigeons: (pigeons as unknown[]).length,
        pairs: (pairs as unknown[]).length,
        breedingRounds: (breedingRounds as unknown[]).length,
        flyingRecords: (flyingRecords as unknown[]).length,
        healthRecords: (healthRecords as unknown[]).length,
        medicineSchedules: (medicineSchedules as unknown[]).length,
        feedPurchases: (feedPurchases as unknown[]).length,
        feedUsage: (feedUsage as unknown[]).length,
        transactions: (transactions as unknown[]).length,
      },
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();

    const [
      pigeons,
      pairs,
      breedingRounds,
      flyingRecords,
      healthRecords,
      medicineSchedules,
      feedPurchases,
      feedUsage,
      transactions,
      settingsDoc,
      breedsDoc,
    ] = await Promise.all([
      PigeonModel.find({}).lean(),
      PairModel.find({}).lean(),
      BreedingRoundModel.find({}).lean(),
      FlyingRecordModel.find({}).lean(),
      HealthRecordModel.find({}).lean(),
      MedicineScheduleModel.find({}).lean(),
      FeedPurchaseModel.find({}).lean(),
      FeedUsageModel.find({}).lean(),
      TransactionModel.find({}).lean(),
      AppConfigModel.findById("SETTINGS").lean(),
      AppConfigModel.findById("BREEDS").lean(),
    ]);

    return NextResponse.json({
      pigeons: pigeons.map((p) => ({ ...p, id: p._id })),
      pairs: pairs.map((p) => ({ ...p, id: p._id })),
      breeding_rounds: breedingRounds.map((r) => ({ ...r, id: r._id })),
      flying_records: flyingRecords.map((r) => ({ ...r, id: r._id })),
      health_records: healthRecords.map((r) => ({ ...r, id: r._id })),
      medicine_schedules: medicineSchedules.map((s) => ({ ...s, id: s._id })),
      feed_purchases: feedPurchases.map((p) => ({ ...p, id: p._id })),
      feed_usage: feedUsage.map((u) => ({ ...u, id: u._id })),
      transactions: transactions.map((t) => ({ ...t, id: t._id })),
      settings: settingsDoc?.data ?? settingsSeed,
      breeds: breedsDoc?.data ?? breedsSeed,
    });
  } catch (error) {
    console.error("GET /api/seed error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
