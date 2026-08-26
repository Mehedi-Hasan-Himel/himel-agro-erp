import { FeedPurchase, FeedUsage, FeedStockSummary } from "@/types/feed";
import { getItem, setItem } from "./storageAdapter";
import { createTransaction } from "./financeRepository";

export async function getFeedPurchases(): Promise<FeedPurchase[]> {
  const purchases = getItem<FeedPurchase[]>("FEED_PURCHASES");
  return [...purchases];
}

export async function createFeedPurchase(
  data: Omit<FeedPurchase, "id">
): Promise<FeedPurchase> {
  if (data.quantityKg <= 0) {
    throw new Error("Purchase quantity must be greater than 0 kg.");
  }
  if (data.totalCost <= 0) {
    throw new Error("Total cost must be greater than 0 BDT.");
  }

  const purchases = await getFeedPurchases();
  const id = `feed_p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newPurchase: FeedPurchase = {
    id,
    ...data,
  };

  const updated = [newPurchase, ...purchases];
  setItem("FEED_PURCHASES", updated);

  // Automatically record finance expense transaction
  try {
    await createTransaction({
      type: "EXPENSE",
      date: data.date,
      category: "Feed",
      amount: data.totalCost,
      description: `Feed Purchase: ${data.quantityKg}kg ${data.feedType} (${data.supplier || "Supplier"})`,
      feedPurchaseId: id,
      notes: data.notes,
    });
  } catch (err) {
    console.warn("Failed to create finance transaction for feed purchase:", err);
  }

  return newPurchase;
}

export async function getFeedUsages(): Promise<FeedUsage[]> {
  const usages = getItem<FeedUsage[]>("FEED_USAGE");
  return [...usages];
}

export async function createFeedUsage(
  data: Omit<FeedUsage, "id">
): Promise<FeedUsage> {
  if (data.quantityKg <= 0) {
    throw new Error("Usage quantity must be greater than 0 kg.");
  }

  // Validate remaining stock
  const summaries = await getFeedStockSummaries();
  const currentSummary = summaries.find(
    (s) => s.feedType.toLowerCase() === data.feedType.toLowerCase()
  );

  const availableStock = currentSummary ? currentSummary.currentStockKg : 0;
  if (data.quantityKg > availableStock) {
    throw new Error(
      `Cannot record usage of ${data.quantityKg}kg ${data.feedType}. Only ${availableStock.toFixed(1)}kg is currently in stock.`
    );
  }

  const usages = await getFeedUsages();
  const id = `feed_u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUsage: FeedUsage = {
    id,
    ...data,
  };

  const updated = [newUsage, ...usages];
  setItem("FEED_USAGE", updated);
  return newUsage;
}

export async function getFeedStockSummaries(): Promise<FeedStockSummary[]> {
  const purchases = await getFeedPurchases();
  const usages = await getFeedUsages();

  const typeMap = new Map<
    string,
    {
      purchasedKg: number;
      usedKg: number;
      totalSpent: number;
    }
  >();

  purchases.forEach((p) => {
    const key = p.feedType.trim();
    const existing = typeMap.get(key) || { purchasedKg: 0, usedKg: 0, totalSpent: 0 };
    existing.purchasedKg += p.quantityKg || 0;
    existing.totalSpent += p.totalCost || 0;
    typeMap.set(key, existing);
  });

  usages.forEach((u) => {
    const key = u.feedType.trim();
    const existing = typeMap.get(key) || { purchasedKg: 0, usedKg: 0, totalSpent: 0 };
    existing.usedKg += u.quantityKg || 0;
    typeMap.set(key, existing);
  });

  const summaries: FeedStockSummary[] = [];

  typeMap.forEach((stats, feedType) => {
    const currentStockKg = Math.max(0, stats.purchasedKg - stats.usedKg);
    const unitCostAvg =
      stats.purchasedKg > 0
        ? Math.round((stats.totalSpent / stats.purchasedKg) * 10) / 10
        : 0;

    let status: "NORMAL" | "LOW" | "OUT_OF_STOCK" = "NORMAL";
    if (currentStockKg <= 0.1) {
      status = "OUT_OF_STOCK";
    } else if (currentStockKg <= 5 || currentStockKg / stats.purchasedKg <= 0.15) {
      status = "LOW";
    }

    summaries.push({
      feedType,
      totalPurchasedKg: Math.round(stats.purchasedKg * 10) / 10,
      totalUsedKg: Math.round(stats.usedKg * 10) / 10,
      currentStockKg: Math.round(currentStockKg * 10) / 10,
      totalSpent: stats.totalSpent,
      unitCostAvg,
      status,
    });
  });

  // Sort: LOW and OUT_OF_STOCK first, then alphabetical
  return summaries.sort((a, b) => {
    const score = (s: FeedStockSummary) =>
      s.status === "OUT_OF_STOCK" ? 0 : s.status === "LOW" ? 1 : 2;
    if (score(a) !== score(b)) return score(a) - score(b);
    return a.feedType.localeCompare(b.feedType);
  });
}
