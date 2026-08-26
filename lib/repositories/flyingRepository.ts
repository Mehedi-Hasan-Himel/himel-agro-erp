import { FlyingRecord } from "@/types/flying";
import { getItem, setItem } from "./storageAdapter";

export async function getFlyingRecords(pigeonId?: string): Promise<FlyingRecord[]> {
  const records = getItem<FlyingRecord[]>("FLYING_RECORDS");
  if (pigeonId) {
    return records.filter((r) => r.pigeonId === pigeonId);
  }
  return [...records];
}

export async function createFlyingRecord(
  data: Omit<FlyingRecord, "id" | "createdAt">
): Promise<FlyingRecord> {
  const records = await getFlyingRecords();
  const id = `fly_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newRecord: FlyingRecord = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...records];
  setItem("FLYING_RECORDS", updated);
  return newRecord;
}

export async function deleteFlyingRecord(id: string): Promise<void> {
  const records = await getFlyingRecords();
  const filtered = records.filter((r) => r.id !== id);
  setItem("FLYING_RECORDS", filtered);
}
