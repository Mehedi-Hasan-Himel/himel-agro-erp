export interface FeedPurchase {
  id: string;

  feedType: string;

  date: string; // YYYY-MM-DD

  quantityKg: number;

  totalCost: number; // in BDT

  supplier?: string;

  notes?: string;
}

export interface FeedUsage {
  id: string;

  feedType: string;

  date: string; // YYYY-MM-DD

  quantityKg: number;

  notes?: string;
}

export interface FeedStockSummary {
  feedType: string;
  totalPurchasedKg: number;
  totalUsedKg: number;
  currentStockKg: number;
  totalSpent: number;
  unitCostAvg: number;
  status: "NORMAL" | "LOW" | "OUT_OF_STOCK";
}
