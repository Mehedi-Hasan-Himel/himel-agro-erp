import { FlyingRecord } from "@/types/flying";
import { notifyDataChanged, fetchWithCache } from "./storageAdapter";

export async function getFlyingRecords(pigeonId?: string): Promise<FlyingRecord[]> {
  const cacheKey = pigeonId ? `flying_${pigeonId}` : "flying_all";
  return fetchWithCache(cacheKey, async () => {
    const url = pigeonId
      ? `/api/flying-records?pigeonId=${encodeURIComponent(pigeonId)}`
      : "/api/flying-records";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch flying records");
    return res.json();
  });
}

export async function createFlyingRecord(
  data: Omit<FlyingRecord, "id" | "createdAt">
): Promise<FlyingRecord> {
  const id = `fly_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newRecord: FlyingRecord = {
    id,
    ...data,
    createdAt: now,
  };

  const res = await fetch("/api/flying-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newRecord, _id: id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create flying record");
  }

  const created: FlyingRecord = await res.json();
  notifyDataChanged();
  return created;
}

export async function deleteFlyingRecord(id: string): Promise<void> {
  const res = await fetch(`/api/flying-records/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete flying record");
  notifyDataChanged();
}
