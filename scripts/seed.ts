import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

// Read .env.local manually without extra dependencies
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env.local:", e);
}

import PigeonModel from "../models/Pigeon";
import PairModel from "../models/Pair";
import BreedingRoundModel from "../models/BreedingRound";
import FlyingRecordModel from "../models/FlyingRecord";
import HealthRecordModel from "../models/HealthRecord";
import MedicineScheduleModel from "../models/MedicineSchedule";
import FeedPurchaseModel from "../models/FeedPurchase";
import FeedUsageModel from "../models/FeedUsage";
import TransactionModel from "../models/Transaction";
import AppConfigModel from "../models/AppConfig";

import pigeonsSeed from "../data/pigeons.json";
import pairsSeed from "../data/pairs.json";
import breedingRoundsSeed from "../data/breedingRounds.json";
import flyingRecordsSeed from "../data/flyingRecords.json";
import healthRecordsSeed from "../data/healthRecords.json";
import medicineSchedulesSeed from "../data/medicineSchedules.json";
import feedPurchasesSeed from "../data/feedPurchases.json";
import feedUsageSeed from "../data/feedUsage.json";
import transactionsSeed from "../data/transactions.json";
import breedsSeed from "../data/breeds.json";
import settingsSeed from "../data/settings.json";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not defined in .env.local");
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  async function upsertCollection(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: mongoose.Model<any>,
    data: Record<string, unknown>[],
    name: string
  ) {
    console.log(`Seeding ${name} (${data.length} records)...`);
    for (const item of data) {
      const id = item._id || item.id;
      await model.findByIdAndUpdate(
        id,
        { $set: { ...item, _id: id } },
        { upsert: true, new: true }
      );
    }
    console.log(`✓ ${name} seeded.`);
  }

  await upsertCollection(PigeonModel, pigeonsSeed, "Pigeons");
  await upsertCollection(PairModel, pairsSeed, "Pairs");
  await upsertCollection(BreedingRoundModel, breedingRoundsSeed, "Breeding Rounds");
  await upsertCollection(FlyingRecordModel, flyingRecordsSeed, "Flying Records");
  await upsertCollection(HealthRecordModel, healthRecordsSeed, "Health Records");
  await upsertCollection(MedicineScheduleModel, medicineSchedulesSeed, "Medicine Schedules");
  await upsertCollection(FeedPurchaseModel, feedPurchasesSeed, "Feed Purchases");
  await upsertCollection(FeedUsageModel, feedUsageSeed, "Feed Usage");
  await upsertCollection(TransactionModel, transactionsSeed, "Transactions");

  console.log("Seeding App Config (Settings & Breeds)...");
  await AppConfigModel.findByIdAndUpdate(
    "SETTINGS",
    { $set: { data: settingsSeed } },
    { upsert: true, new: true }
  );
  await AppConfigModel.findByIdAndUpdate(
    "BREEDS",
    { $set: { data: breedsSeed } },
    { upsert: true, new: true }
  );
  console.log("✓ App Config seeded.");

  console.log("\n🎉 Database seeded successfully into MongoDB Atlas!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
