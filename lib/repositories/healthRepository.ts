import { HealthRecord, MedicineSchedule } from "@/types/health";
import { getItem, setItem } from "./storageAdapter";

export async function getHealthRecords(pigeonId?: string): Promise<HealthRecord[]> {
  const records = getItem<HealthRecord[]>("HEALTH_RECORDS");
  if (pigeonId) {
    return records.filter((r) => r.pigeonId === pigeonId || r.targetType === "FLOCK");
  }
  return [...records];
}

export async function createHealthRecord(
  data: Omit<HealthRecord, "id" | "createdAt">
): Promise<HealthRecord> {
  const records = await getHealthRecords();
  const id = `health_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newRecord: HealthRecord = {
    id,
    ...data,
    createdAt: now,
  };

  const updated = [newRecord, ...records];
  setItem("HEALTH_RECORDS", updated);
  return newRecord;
}

export async function getMedicineSchedules(): Promise<MedicineSchedule[]> {
  const schedules = getItem<MedicineSchedule[]>("MEDICINE_SCHEDULES");
  return [...schedules];
}

export async function createMedicineSchedule(
  data: Omit<MedicineSchedule, "id" | "createdAt">
): Promise<MedicineSchedule> {
  const schedules = await getMedicineSchedules();
  const id = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newSchedule: MedicineSchedule = {
    id,
    ...data,
    createdAt: now,
  };

  const updated = [newSchedule, ...schedules];
  setItem("MEDICINE_SCHEDULES", updated);
  return newSchedule;
}

export async function updateMedicineSchedule(
  id: string,
  data: Partial<MedicineSchedule>
): Promise<MedicineSchedule> {
  const schedules = await getMedicineSchedules();
  const index = schedules.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error(`Medicine schedule "${id}" not found.`);
  }

  const updated: MedicineSchedule = {
    ...schedules[index],
    ...data,
  };

  schedules[index] = updated;
  setItem("MEDICINE_SCHEDULES", schedules);
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
