import { HealthRecord, MedicineSchedule } from "@/types/health";
import { notifyDataChanged, fetchWithCache } from "./storageAdapter";

export async function getHealthRecords(pigeonId?: string): Promise<HealthRecord[]> {
  const cacheKey = pigeonId ? `health_${pigeonId}` : "health_all";
  return fetchWithCache(cacheKey, async () => {
    const url = pigeonId
      ? `/api/health-records?pigeonId=${encodeURIComponent(pigeonId)}`
      : "/api/health-records";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch health records");
    return res.json();
  });
}

export async function createHealthRecord(
  data: Omit<HealthRecord, "id" | "createdAt">
): Promise<HealthRecord> {
  const id = `health_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newRecord: HealthRecord = {
    id,
    ...data,
    createdAt: now,
  };

  const res = await fetch("/api/health-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newRecord, _id: id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create health record");
  }

  const created: HealthRecord = await res.json();
  notifyDataChanged();
  return created;
}

export async function getMedicineSchedules(): Promise<MedicineSchedule[]> {
  return fetchWithCache("medicine_schedules", async () => {
    const res = await fetch("/api/medicine-schedules");
    if (!res.ok) throw new Error("Failed to fetch medicine schedules");
    return res.json();
  });
}

export async function createMedicineSchedule(
  data: Omit<MedicineSchedule, "id" | "createdAt">
): Promise<MedicineSchedule> {
  const id = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newSchedule: MedicineSchedule = {
    id,
    ...data,
    createdAt: now,
  };

  const res = await fetch("/api/medicine-schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newSchedule, _id: id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create medicine schedule");
  }

  const created: MedicineSchedule = await res.json();
  notifyDataChanged();
  return created;
}

export async function updateMedicineSchedule(
  id: string,
  data: Partial<MedicineSchedule>
): Promise<MedicineSchedule> {
  const updatePayload = { ...data };
  delete (updatePayload as Partial<MedicineSchedule> & { id?: string }).id;

  const res = await fetch(`/api/medicine-schedules/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update medicine schedule");
  }

  const updated: MedicineSchedule = await res.json();
  notifyDataChanged();
  return updated;
}

export async function getDueMedicineSchedules(targetDateStr?: string): Promise<{
  dueToday: MedicineSchedule[];
  upcoming: MedicineSchedule[];
}> {
  const schedules = await getMedicineSchedules();
  const todayStr = targetDateStr || new Date().toISOString().split("T")[0];

  const dueToday: MedicineSchedule[] = [];
  const upcoming: MedicineSchedule[] = [];

  schedules.forEach((sched) => {
    if (sched.status === "COMPLETED") return;

    if (sched.startDate <= todayStr && sched.endDate >= todayStr) {
      dueToday.push(sched);
    } else if (sched.startDate > todayStr) {
      upcoming.push(sched);
    }
  });

  return { dueToday, upcoming };
}
