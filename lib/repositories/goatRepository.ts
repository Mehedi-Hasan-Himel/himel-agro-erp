import {
  Goat,
  GoatStatus,
  GoatSex,
  GoatBreedingRecord,
  GoatHealthRecord,
  GoatFeedStock,
  FarmGoatStats,
} from "@/types/goat";
import { notifyDataChanged, fetchWithCache } from "./storageAdapter";

export function generateGoatTagNumber(currentCount: number): string {
  const serial = String(currentCount + 1).padStart(2, "0");
  return `HA-GT-${serial}`;
}

export async function getGoats(filter?: {
  status?: GoatStatus | "ALL";
  sex?: GoatSex | "ALL";
  breed?: string;
  search?: string;
}): Promise<Goat[]> {
  const params = new URLSearchParams();
  if (filter?.status && filter.status !== "ALL") params.set("status", filter.status);
  if (filter?.sex && filter.sex !== "ALL") params.set("sex", filter.sex);
  if (filter?.breed && filter.breed !== "ALL") params.set("breed", filter.breed);
  if (filter?.search) params.set("search", filter.search);

  const queryStr = params.toString();
  const cacheKey = `goats_${queryStr || "all"}`;

  return fetchWithCache(cacheKey, async () => {
    const url = `/api/goats${queryStr ? `?${queryStr}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch goats");
    return res.json();
  });
}

export async function getGoatById(id: string): Promise<Goat | null> {
  return fetchWithCache(`goat_${id}`, async () => {
    const res = await fetch(`/api/goats/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch goat");
    return res.json();
  });
}

export async function createGoat(
  data: Omit<Goat, "id" | "createdAt" | "updatedAt">
): Promise<Goat> {
  const id = `goat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newGoat: Goat = {
    ...data,
    id,
    sectorId: "GOAT",
    createdAt: now,
    updatedAt: now,
  };

  const res = await fetch("/api/goats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newGoat, _id: id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create goat");
  }

  const created: Goat = await res.json();
  notifyDataChanged();
  return created;
}

export async function updateGoat(id: string, data: Partial<Goat>): Promise<Goat> {
  const res = await fetch(`/api/goats/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update goat");
  }

  const updated: Goat = await res.json();
  notifyDataChanged();
  return updated;
}

export async function deleteGoat(id: string): Promise<void> {
  const res = await fetch(`/api/goats/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete goat");
  }

  notifyDataChanged();
}

export async function getFarmGoatStats(): Promise<FarmGoatStats> {
  const goats = await getGoats();

  const totalGoats = goats.length;
  const activeHerd = goats.filter((g) => g.status === "ACTIVE" || g.status === "PREGNANT" || g.status === "LACTATING").length;
  const bucksCount = goats.filter((g) => g.sex === "MALE" && g.status !== "SOLD" && g.status !== "DEAD").length;
  const doesCount = goats.filter((g) => g.sex === "FEMALE" && g.status !== "SOLD" && g.status !== "DEAD").length;
  const pregnantCount = goats.filter((g) => g.status === "PREGNANT" || g.pregnancyStatus === "PREGNANT").length;
  const kidsCount = goats.filter((g) => {
    if (g.status === "SOLD" || g.status === "DEAD") return false;
    if (!g.birthDate) return false;
    const ageMonths = (Date.now() - new Date(g.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.4);
    return ageMonths < 6;
  }).length;
  const soldCount = goats.filter((g) => g.status === "SOLD").length;
  const mortalityCount = goats.filter((g) => g.status === "DEAD").length;

  const blackBengalCount = goats.filter((g) => (g.breed || "").toLowerCase().includes("bengal")).length;
  const jamunapariCount = goats.filter((g) => (g.breed || "").toLowerCase().includes("jamunapari")).length;
  const boerCount = goats.filter((g) => (g.breed || "").toLowerCase().includes("boer")).length;
  const otherBreedsCount = totalGoats - (blackBengalCount + jamunapariCount + boerCount);

  return {
    totalGoats,
    activeHerd,
    bucksCount,
    doesCount,
    pregnantCount,
    kidsCount,
    soldCount,
    mortalityCount,
    blackBengalCount,
    jamunapariCount,
    boerCount,
    otherBreedsCount,
  };
}

export async function getGoatBreedingRecords(): Promise<GoatBreedingRecord[]> {
  return fetchWithCache("goat_breeding_records", async () => {
    const res = await fetch("/api/goats/breeding");
    if (!res.ok) throw new Error("Failed to fetch goat breeding records");
    return res.json();
  });
}

export async function getGoatHealthRecords(): Promise<GoatHealthRecord[]> {
  return fetchWithCache("goat_health_records", async () => {
    const res = await fetch("/api/goats/health");
    if (!res.ok) throw new Error("Failed to fetch goat health records");
    return res.json();
  });
}

export async function getGoatFeedStock(): Promise<GoatFeedStock[]> {
  return fetchWithCache("goat_feed_stock", async () => {
    const res = await fetch("/api/goats/feed");
    if (!res.ok) throw new Error("Failed to fetch goat feed stock");
    return res.json();
  });
}
