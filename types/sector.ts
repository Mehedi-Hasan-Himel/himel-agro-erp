export type AnimalSectorId =
  | "PIGEON"
  | "GOAT"
  | "COW"
  | "CHICKEN"
  | "BUFFALO"
  | "SHEEP"
  | "FISH"
  | string;

export interface AnimalSectorTerminology {
  maleTerm: string; // e.g. "Cock", "Buck", "Bull", "Rooster"
  femaleTerm: string; // e.g. "Hen", "Doe", "Cow", "Hen"
  youngTerm: string; // e.g. "Squab", "Kid", "Calf", "Chick"
  castratedTerm?: string; // e.g. "Wether", "Steer", "Capon"
  identifierLabel: string; // e.g. "Ring #", "Ear Tag #", "Tag ID"
  housingLabel: string; // e.g. "Loft / Cage", "Pen / Shed", "Barn / Stall"
  groupName: string; // e.g. "Flock", "Herd", "School"
}

export interface AnimalSectorConfig {
  id: AnimalSectorId;
  key: string; // e.g. "pigeon", "goat"
  name: string; // e.g. "Pigeon", "Goat"
  displayName: string; // e.g. "Pigeons (Loft)", "Goats (Caprine)"
  pluralName: string; // e.g. "Pigeons", "Goats"
  singularName: string; // e.g. "Pigeon", "Goat"
  icon: string; // e.g. "🕊️", "🐐", "🐄"
  color: string; // Tailwind color token: "emerald", "amber", "indigo"
  enabled: boolean;
  comingSoon?: boolean;
  terminology: AnimalSectorTerminology;
  modules: {
    registry: boolean;
    breeding: boolean;
    pedigree: boolean;
    health: boolean;
    feed: boolean;
    finance: boolean;
  };
  navigation: {
    registryHref: string;
    breedingHref: string;
    pedigreeHref?: string;
    healthHref: string;
    feedHref: string;
  };
}
