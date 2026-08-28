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
  };
}

const globalWithStore = global as typeof globalThis & {
  __himelAgroFallbackStore?: StoreState;
};

if (!globalWithStore.__himelAgroFallbackStore) {
  globalWithStore.__himelAgroFallbackStore = createInitialState();
}

export const fallbackStore = {
  get: () => globalWithStore.__himelAgroFallbackStore!,
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
