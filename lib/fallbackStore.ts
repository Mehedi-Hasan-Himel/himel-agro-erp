import pigeonsSeed from "@/data/pigeons.json";
import pairsSeed from "@/data/pairs.json";
import breedingRoundsSeed from "@/data/breedingRounds.json";
import flyingRecordsSeed from "@/data/flyingRecords.json";
import healthRecordsSeed from "@/data/healthRecords.json";
import medicineSchedulesSeed from "@/data/medicineSchedules.json";
import feedPurchasesSeed from "@/data/feedPurchases.json";
import feedUsageSeed from "@/data/feedUsage.json";
import transactionsSeed from "@/data/transactions.json";
import settingsSeed from "@/data/settings.json";
import breedsSeed from "@/data/breeds.json";
import goatsSeed from "@/data/goats.json";
import goatBreedingSeed from "@/data/goatBreeding.json";
import goatHealthSeed from "@/data/goatHealth.json";
import goatFeedSeed from "@/data/goatFeed.json";

interface StoreState {
  pigeons: Record<string, unknown>[];
  pairs: Record<string, unknown>[];
  breedingRounds: Record<string, unknown>[];
  flyingRecords: Record<string, unknown>[];
  healthRecords: Record<string, unknown>[];
  medicineSchedules: Record<string, unknown>[];
  feedPurchases: Record<string, unknown>[];
  feedUsage: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  settings: Record<string, unknown>;
  breeds: string[];
  goats: Record<string, unknown>[];
  goatBreeding: Record<string, unknown>[];
  goatHealth: Record<string, unknown>[];
  goatFeed: Record<string, unknown>[];
}

function createInitialState(): StoreState {
  return {
    pigeons: JSON.parse(JSON.stringify(pigeonsSeed)),
    pairs: JSON.parse(JSON.stringify(pairsSeed)),
    breedingRounds: JSON.parse(JSON.stringify(breedingRoundsSeed)),
    flyingRecords: JSON.parse(JSON.stringify(flyingRecordsSeed)),
    healthRecords: JSON.parse(JSON.stringify(healthRecordsSeed)),
    medicineSchedules: JSON.parse(JSON.stringify(medicineSchedulesSeed)),
    feedPurchases: JSON.parse(JSON.stringify(feedPurchasesSeed)),
    feedUsage: JSON.parse(JSON.stringify(feedUsageSeed)),
    transactions: JSON.parse(JSON.stringify(transactionsSeed)),
    settings: JSON.parse(JSON.stringify(settingsSeed)),
    breeds: JSON.parse(JSON.stringify(breedsSeed)),
    goats: JSON.parse(JSON.stringify(goatsSeed)),
    goatBreeding: JSON.parse(JSON.stringify(goatBreedingSeed)),
    goatHealth: JSON.parse(JSON.stringify(goatHealthSeed)),
    goatFeed: JSON.parse(JSON.stringify(goatFeedSeed)),
  };
}

const globalWithStore = global as typeof globalThis & {
  __himelAgroFallbackStore?: StoreState;
};

if (!globalWithStore.__himelAgroFallbackStore) {
  globalWithStore.__himelAgroFallbackStore = createInitialState();
}

export const fallbackStore = {
  get: () => {
    const store = globalWithStore.__himelAgroFallbackStore!;
    if (!store.goats || store.goats.length === 0) {
      store.goats = JSON.parse(JSON.stringify(goatsSeed));
    }
    if (!store.goatBreeding || store.goatBreeding.length === 0) {
      store.goatBreeding = JSON.parse(JSON.stringify(goatBreedingSeed));
    }
    if (!store.goatHealth || store.goatHealth.length === 0) {
      store.goatHealth = JSON.parse(JSON.stringify(goatHealthSeed));
    }
    if (!store.goatFeed || store.goatFeed.length === 0) {
      store.goatFeed = JSON.parse(JSON.stringify(goatFeedSeed));
    }
    const hasGoatTxn = store.transactions.some((t) => t.sectorId === "GOAT");
    if (!hasGoatTxn) {
      const goatTxns = (transactionsSeed as Record<string, unknown>[]).filter(
        (t) => t.sectorId === "GOAT"
      );
      if (goatTxns.length > 0) {
        store.transactions.push(...JSON.parse(JSON.stringify(goatTxns)));
      }
    }
    return store;
  },
  reset: () => {
    globalWithStore.__himelAgroFallbackStore = createInitialState();
    return globalWithStore.__himelAgroFallbackStore;
  },
  set: (newState: Partial<StoreState>) => {
    globalWithStore.__himelAgroFallbackStore = {
      ...globalWithStore.__himelAgroFallbackStore!,
      ...newState,
    };
    return globalWithStore.__himelAgroFallbackStore;
  },
};
