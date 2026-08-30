import { FeedPurchase, FeedUsage, FeedStockSummary } from "@/types/feed";
import { notifyDataChanged, fetchWithCache } from "./storageAdapter";

export async function getFeedPurchases(): Promise<FeedPurchase[]> {
  return fetchWithCache("feed_purchases", async () => {
    const res = await fetch("/api/feed-purchases");
    if (!res.ok) throw new Error("Failed to fetch feed purchases");
    return res.json();
  });
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

  const id = `feed_p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newPurchase: FeedPurchase = {
    id,
    ...data,
  };

  const res = await fetch("/api/feed-purchases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newPurchase, _id: id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create feed purchase");
  }

  const created: FeedPurchase = await res.json();

  // Automatically record finance expense transaction
  try {
    const { createTransaction } = await import("./financeRepository");
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

  notifyDataChanged();
  return created;
}

export async function getFeedUsages(): Promise<FeedUsage[]> {
  return fetchWithCache("feed_usages", async () => {
    const res = await fetch("/api/feed-usage");
    if (!res.ok) throw new Error("Failed to fetch feed usage");
    return res.json();
  });
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

  const id = `feed_u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUsage: FeedUsage = {
    id,
    ...data,
  };

  const res = await fetch("/api/feed-usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newUsage, _id: id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create feed usage");
  }

  const created: FeedUsage = await res.json();
  notifyDataChanged();
  return created;
}

export async function getFeedStockSummaries(): Promise<FeedStockSummary[]> {
  const [purchases, usages] = await Promise.all([
    getFeedPurchases(),
    getFeedUsages(),
  ]);

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
