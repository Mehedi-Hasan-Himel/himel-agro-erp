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

const STORAGE_KEYS = {
  PIGEONS: "himel_agro_pigeons",
  PAIRS: "himel_agro_pairs",
  BREEDING_ROUNDS: "himel_agro_breeding_rounds",
  FLYING_RECORDS: "himel_agro_flying_records",
  HEALTH_RECORDS: "himel_agro_health_records",
  MEDICINE_SCHEDULES: "himel_agro_medicine_schedules",
  FEED_PURCHASES: "himel_agro_feed_purchases",
  FEED_USAGE: "himel_agro_feed_usage",
  TRANSACTIONS: "himel_agro_transactions",
  BREEDS: "himel_agro_breeds",
  SETTINGS: "himel_agro_settings",
  INITIALIZED: "himel_agro_initialized_v1",
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

const seedDefaults: Record<string, unknown> = {
  [STORAGE_KEYS.PIGEONS]: pigeonsSeed,
  [STORAGE_KEYS.PAIRS]: pairsSeed,
  [STORAGE_KEYS.BREEDING_ROUNDS]: breedingRoundsSeed,
  [STORAGE_KEYS.FLYING_RECORDS]: flyingRecordsSeed,
  [STORAGE_KEYS.HEALTH_RECORDS]: healthRecordsSeed,
  [STORAGE_KEYS.MEDICINE_SCHEDULES]: medicineSchedulesSeed,
  [STORAGE_KEYS.FEED_PURCHASES]: feedPurchasesSeed,
  [STORAGE_KEYS.FEED_USAGE]: feedUsageSeed,
  [STORAGE_KEYS.TRANSACTIONS]: transactionsSeed,
  [STORAGE_KEYS.BREEDS]: breedsSeed,
  [STORAGE_KEYS.SETTINGS]: settingsSeed,
};

export const DATA_CHANGE_EVENT = "himel-agro-data-updated";

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function initStorage(): void {
  if (!isClient()) return;

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized) {
    resetToSeedData();
  }
}

export function resetToSeedData(): void {
  if (!isClient()) return;

  Object.entries(seedDefaults).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
  notifyDataChanged();
}

export function getItem<T>(key: keyof typeof STORAGE_KEYS): T {
  const actualKey = STORAGE_KEYS[key];
  if (!isClient()) {
    return (seedDefaults[actualKey] as T) ?? ([] as unknown as T);
  }

  initStorage();
  const raw = localStorage.getItem(actualKey);
  if (!raw) {
    const fallback = seedDefaults[actualKey] as T;
    localStorage.setItem(actualKey, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error parsing localStorage key: ${actualKey}`, err);
    return seedDefaults[actualKey] as T;
  }
}

export function setItem<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
  const actualKey = STORAGE_KEYS[key];
  if (!isClient()) return;

  localStorage.setItem(actualKey, JSON.stringify(value));
  notifyDataChanged();
}

export function notifyDataChanged(): void {
  if (!isClient()) return;
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
}

export function exportAllData(): string {
  if (!isClient()) return JSON.stringify(seedDefaults, null, 2);

  const dump: Record<string, unknown> = {};
  Object.entries(STORAGE_KEYS).forEach(([name, actualKey]) => {
    if (name === "INITIALIZED") return;
    const raw = localStorage.getItem(actualKey);
    dump[name.toLowerCase()] = raw ? JSON.parse(raw) : seedDefaults[actualKey];
  });

  return JSON.stringify(dump, null, 2);
}

export function importAllData(jsonString: string): boolean {
  if (!isClient()) return false;

  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.pigeons) setItem("PIGEONS", parsed.pigeons);
    if (parsed.pairs) setItem("PAIRS", parsed.pairs);
    if (parsed.breeding_rounds || parsed.breedingrounds) setItem("BREEDING_ROUNDS", parsed.breeding_rounds || parsed.breedingrounds);
    if (parsed.flying_records || parsed.flyingrecords) setItem("FLYING_RECORDS", parsed.flying_records || parsed.flyingrecords);
    if (parsed.health_records || parsed.healthrecords) setItem("HEALTH_RECORDS", parsed.health_records || parsed.healthrecords);
    if (parsed.medicine_schedules || parsed.medicineschedules) setItem("MEDICINE_SCHEDULES", parsed.medicine_schedules || parsed.medicineschedules);
    if (parsed.feed_purchases || parsed.feedpurchases) setItem("FEED_PURCHASES", parsed.feed_purchases || parsed.feedpurchases);
    if (parsed.feed_usage || parsed.feedusage) setItem("FEED_USAGE", parsed.feed_usage || parsed.feedusage);
    if (parsed.transactions) setItem("TRANSACTIONS", parsed.transactions);
    if (parsed.breeds) setItem("BREEDS", parsed.breeds);
    if (parsed.settings) setItem("SETTINGS", parsed.settings);

    notifyDataChanged();
    return true;
  } catch (err) {
    console.error("Failed to import data:", err);
    return false;
  }
}
