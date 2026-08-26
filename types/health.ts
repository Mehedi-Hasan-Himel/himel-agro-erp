export type TreatmentTarget = "INDIVIDUAL" | "FLOCK";

export type MedicineScheduleStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED";

export interface HealthRecord {
  id: string;

  targetType: TreatmentTarget;

  pigeonId?: string | null;

  medicineName: string;

  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD

  dose?: string;

  purpose?: string;

  notes?: string;

  createdAt: string;
}

export interface MedicineSchedule {
  id: string;

  medicineName: string;

  targetType: TreatmentTarget;

  pigeonId?: string | null;

  startDate: string;
  endDate: string;

  dose?: string;

  purpose?: string;

  status: MedicineScheduleStatus;

  notes?: string;

  createdAt: string;
}
