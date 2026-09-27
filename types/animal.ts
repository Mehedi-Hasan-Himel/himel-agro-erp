import { AnimalSectorId } from "./sector";

export type BaseAnimalSex = "MALE" | "FEMALE" | "CASTRATED_MALE" | "UNKNOWN" | string;

export interface BaseAnimal {
  id: string;
  sectorId?: AnimalSectorId;
  identifier?: string; // Tag, ring, or registration number
  name?: string;
  breed: string;
  breedSubtype?: string;
  color?: string;
  colorPattern?: string;
  sex: BaseAnimalSex;
  birthDate?: string;
  hatchDate?: string;
  status: string; // ACTIVE, SOLD, DEAD, LOST, PREGNANT, etc.

  fatherId?: string | null;
  motherId?: string | null;
  fatherDetails?: string;
  motherDetails?: string;

  clutchId?: string; // Bird egg clutch identifier
  litterId?: string; // Mammal birth litter identifier

  photoUrl?: string;
  photos?: string[];
  purchasePrice?: number;
  salePrice?: number;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export type KinshipCategory =
  | "PARENT"
  | "TWIN_SIBLING"
  | "FULL_SIBLING"
  | "MATERNAL_HALF_SIBLING"
  | "PATERNAL_HALF_SIBLING"
  | "CHILD"
  | "GRANDCHILD"
  | "GRANDPARENT"
  | "UNCLE_AUNT"
  | "NEPHEW_NIECE"
  | "COUSIN";

export interface KinshipRelation<T extends BaseAnimal = BaseAnimal> {
  animal: T;
  relationship: string; // e.g. "Full Brother", "Daughter", "Granddam", "Buck"
  relationshipCategory: KinshipCategory;
  details?: string;
}

export interface KinshipSummary<T extends BaseAnimal = BaseAnimal> {
  subject: T;
  father: T | null;
  mother: T | null;
  twinSiblings: KinshipRelation<T>[];
  fullSiblings: KinshipRelation<T>[];
  maternalHalfSiblings: KinshipRelation<T>[];
  paternalHalfSiblings: KinshipRelation<T>[];
  children: KinshipRelation<T>[];
  grandchildren: KinshipRelation<T>[];
  grandparents: KinshipRelation<T>[];
  unclesAndAunts: KinshipRelation<T>[];
  nephewsAndNieces: KinshipRelation<T>[];
  cousins: KinshipRelation<T>[];
  totalRelationsCount: number;
}
