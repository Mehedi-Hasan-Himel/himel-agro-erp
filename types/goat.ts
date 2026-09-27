import { BaseAnimal } from "./animal";

export type GoatStatus =
  | "ACTIVE"
  | "PREGNANT"
  | "LACTATING"
  | "SOLD"
  | "DEAD"
  | "QUARANTINED";

export type GoatSex = "MALE" | "FEMALE" | "CASTRATED_MALE";

export type GoatHornStatus = "HORNED" | "POLLED" | "DISBUDDED";

export interface Goat extends BaseAnimal {
  tagNumber: string; // e.g. "HA-GT-01" (Ear Tag Number)
  hornStatus?: GoatHornStatus;
  weightKg?: number;
  pregnancyStatus?: "NOT_PREGNANT" | "PREGNANT" | "LACTATING";
  expectedKiddingDate?: string; // YYYY-MM-DD
  kidsBorn?: number;
  penLocation?: string; // e.g. "Shed 1 - Pen A"
  source: "BORN_HIMEL_AGRO" | "PURCHASED";
  purchaseDate?: string;
  purchasePrice?: number;
  seller?: string;
  saleDate?: string;
  salePrice?: number;
  buyer?: string;
}

export interface GoatBreedingRecord {
  id: string;
  doeId: string; // Mother (Dam) ID
  buckId: string; // Father (Sire) ID
  doeTagNumber?: string;
  buckTagNumber?: string;
  matingDate: string; // YYYY-MM-DD
  status: "MATING" | "CONFIRMED_PREGNANT" | "KIDDING_COMPLETED" | "FAILED";
  expectedKiddingDate: string; // Gestation ~ 150 days
  actualKiddingDate?: string;
  kidsCount?: number;
  kidIds?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoatHealthRecord {
  id: string;
  goatId?: string; // Specific goat ID or "HERD" for herd-wide treatment
  targetTagNumber?: string;
  treatmentType: "VACCINE" | "DEWORMING" | "MEDICATION" | "HOOF_TRIMMING" | "CHECKUP";
  name: string; // e.g. "PPR Vaccine", "Enterotoxaemia (ET)", "Ivermectin"
  dosage: string;
  date: string; // YYYY-MM-DD
  nextDueDate?: string;
  administeredBy?: string;
  notes?: string;
  createdAt: string;
}

export interface GoatFeedStock {
  feedType: string; // "Napier Green Grass", "Dry Rice Straw", "Concentrate Mash", "Mineral Salt Block"
  currentStockKg: number;
  totalUsedKg: number;
  reorderLevelKg: number;
  status: "OPTIMAL" | "LOW" | "OUT_OF_STOCK";
}

export interface FarmGoatStats {
  totalGoats: number;
  activeHerd: number;
  bucksCount: number; // Males
  doesCount: number; // Females
  pregnantCount: number;
  kidsCount: number; // Young
  soldCount: number;
  mortalityCount: number;
  blackBengalCount: number;
  jamunapariCount: number;
  boerCount: number;
  otherBreedsCount: number;
}
