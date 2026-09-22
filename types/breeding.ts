export type PairStatus = "ACTIVE" | "ENDED";

export interface Pair {
  id: string; // e.g. "2025-01-GCM_2025-02-GCF" (male + female id)

  maleId: string;
  femaleId: string;

  startDate: string; // YYYY-MM-DD
  endDate?: string | null;

  status: PairStatus;

  cageNumber?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface BreedingRound {
  id: string; // e.g. "round_2026_01_01"

  pairId: string;

  roundNumber: number;

  date?: string; // Laying or start date (YYYY-MM-DD)
  hatchDate?: string;
  eggsLaid: number;
  babiesHatched: number;

  babyPigeonIds: string[];

  notes?: string;

  createdAt: string;
}

export interface HatchingStats {
  totalRounds: number;
  totalEggs: number;
  totalHatched: number;
  hatchingRate: number; // percentage (0-100)
}
