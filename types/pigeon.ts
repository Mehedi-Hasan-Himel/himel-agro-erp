export type PigeonStatus = "ACTIVE" | "SOLD" | "DEAD" | "LOST";

export type PigeonSource = "BORN_HIMEL_AGRO" | "PURCHASED";

export type PigeonSex = "MALE" | "FEMALE" | "UNKNOWN";

export interface Pigeon {
  id: string; // e.g. "pigeon_2026_001"

  ringYear: number;
  ringSerial: number;
  officialRingNumber?: string;
  farmName: string;
  contactNumber: string;

  hatchDate: string; // YYYY-MM-DD

  sex: PigeonSex;

  breed: string;
  breedSubtype?: string;
  colorPattern?: string;

  photoUrl?: string;
  photos?: string[];
  videos?: string[];

  fatherId?: string | null;
  motherId?: string | null;
  fatherDetails?: string;
  motherDetails?: string;
  potentialGrade?: string;
  birthDate?: string; // Authoritative birth date (defaults to hatchDate)
  clutchId?: string; // Clutch / egg batch identifier
  pairId?: string; // Breeding pair identifier that produced this pigeon

  source: PigeonSource;

  purchaseDate?: string;
  purchasePrice?: number;
  seller?: string;

  status: PigeonStatus;
  isForSale?: boolean;
  askingPrice?: number;

  saleDate?: string;
  salePrice?: number;
  buyer?: string;
  saleReason?: string;

  deathDate?: string;
  deathReason?: string;

  lostDate?: string;
  lostNotes?: string;

  firstFlyingDate?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}
