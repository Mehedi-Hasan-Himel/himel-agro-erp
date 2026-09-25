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

export interface GoogleDocMedicineCourse {
  id: string;
  serial: number;
  title: string;
  durationDays: number;
  dateRangeText: string;
  startDay: number;
  endDay: number;
  medicine: string;
  dose: string;
  benefits?: string;
  instructions?: string;
  breakText?: string;
}

export interface GoogleDocMedicineGroup {
  id: string;
  groupNumber: number;
  title: string;
  applicableMonths: number[]; // 1-12
  monthNamesText: string;
  courses: GoogleDocMedicineCourse[];
}

export interface GoogleDocMedicineGuidelines {
  title: string;
  specialNotice: string;
  documentUrl: string;
  lastFetchedAt: string;
  groups: GoogleDocMedicineGroup[];
  activeGroup?: GoogleDocMedicineGroup;
}

