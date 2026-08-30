export type PigeonStatus = "ACTIVE" | "SOLD" | "DEAD" | "LOST";

export type PigeonSource = "BORN_HIMEL_AGRO" | "PURCHASED";

export type PigeonSex = "MALE" | "FEMALE" | "UNKNOWN";

export interface Pigeon {
  id: string; // e.g. "pigeon_2026_001"

  ringYear: number;
  ringSerial: number;
  farmName: string;
  contactNumber: string;

  hatchDate: string; // YYYY-MM-DD

  sex: PigeonSex;

  breed: string;
  breedSubtype?: string;

  photoUrl?: string;
  photos?: string[];

  fatherId?: string | null;
  motherId?: string | null;

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
