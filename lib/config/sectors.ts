import { AnimalSectorConfig, AnimalSectorId } from "@/types/sector";

export const ANIMAL_SECTORS: Record<string, AnimalSectorConfig> = {
  PIGEON: {
    id: "PIGEON",
    key: "pigeon",
    name: "Pigeon",
    displayName: "Pigeon Loft",
    pluralName: "Pigeons",
    singularName: "Pigeon",
    icon: "🕊️",
    color: "emerald",
    enabled: true,
    terminology: {
      maleTerm: "Cock",
      femaleTerm: "Hen",
      youngTerm: "Squab",
      identifierLabel: "Physical Ring #",
      housingLabel: "Loft / Cage",
      groupName: "Flock",
    },
    modules: {
      registry: true,
      breeding: true,
      pedigree: true,
      health: true,
      feed: true,
      finance: true,
    },
    navigation: {
      registryHref: "/pigeons",
      breedingHref: "/breeding/pairs",
      healthHref: "/health",
      feedHref: "/feed",
    },
  },

  GOAT: {
    id: "GOAT",
    key: "goat",
    name: "Goat",
    displayName: "Goat Farm",
    pluralName: "Goats",
    singularName: "Goat",
    icon: "🐐",
    color: "amber",
    enabled: true,
    terminology: {
      maleTerm: "Buck",
      femaleTerm: "Doe",
      youngTerm: "Kid",
      castratedTerm: "Wether",
      identifierLabel: "Ear Tag #",
      housingLabel: "Pen / Shed",
      groupName: "Herd",
    },
    modules: {
      registry: true,
      breeding: true,
      pedigree: true,
      health: true,
      feed: true,
      finance: true,
    },
    navigation: {
      registryHref: "/goats",
      breedingHref: "/goats/breeding",
      healthHref: "/goats/health",
      feedHref: "/goats/feed",
    },
  },

  COW: {
    id: "COW",
    key: "cow",
    name: "Cow",
    displayName: "Cattle & Dairy",
    pluralName: "Cows",
    singularName: "Cow",
    icon: "🐄",
    color: "blue",
    enabled: false,
    comingSoon: true,
    terminology: {
      maleTerm: "Bull",
      femaleTerm: "Cow",
      youngTerm: "Calf",
      castratedTerm: "Steer",
      identifierLabel: "Ear Tag #",
      housingLabel: "Barn / Stall",
      groupName: "Herd",
    },
    modules: {
      registry: true,
      breeding: true,
      pedigree: true,
      health: true,
      feed: true,
      finance: true,
    },
    navigation: {
      registryHref: "/cows",
      breedingHref: "/cows/breeding",
      healthHref: "/cows/health",
      feedHref: "/cows/feed",
    },
  },

  CHICKEN: {
    id: "CHICKEN",
    key: "chicken",
    name: "Chicken",
    displayName: "Poultry & Layer",
    pluralName: "Chickens",
    singularName: "Chicken",
    icon: "🐔",
    color: "orange",
    enabled: false,
    comingSoon: true,
    terminology: {
      maleTerm: "Rooster",
      femaleTerm: "Hen",
      youngTerm: "Chick",
      identifierLabel: "Wing / Leg Band",
      housingLabel: "Coop / Run",
      groupName: "Flock",
    },
    modules: {
      registry: true,
      breeding: true,
      pedigree: true,
      health: true,
      feed: true,
      finance: true,
    },
    navigation: {
      registryHref: "/chickens",
      breedingHref: "/chickens/breeding",
      healthHref: "/chickens/health",
      feedHref: "/chickens/feed",
    },
  },

  SHEEP: {
    id: "SHEEP",
    key: "sheep",
    name: "Sheep",
    displayName: "Sheep & Ram",
    pluralName: "Sheep",
    singularName: "Sheep",
    icon: "🐑",
    color: "purple",
    enabled: false,
    comingSoon: true,
    terminology: {
      maleTerm: "Ram",
      femaleTerm: "Ewe",
      youngTerm: "Lamb",
      castratedTerm: "Wether",
      identifierLabel: "Ear Tag #",
      housingLabel: "Paddock / Fold",
      groupName: "Flock",
    },
    modules: {
      registry: true,
      breeding: true,
      pedigree: true,
      health: true,
      feed: true,
      finance: true,
    },
    navigation: {
      registryHref: "/sheep",
      breedingHref: "/sheep/breeding",
      healthHref: "/sheep/health",
      feedHref: "/sheep/feed",
    },
  },
};

export const DEFAULT_ACTIVE_SECTORS: AnimalSectorId[] = ["PIGEON", "GOAT"];

export function getSectorConfig(sectorId: AnimalSectorId): AnimalSectorConfig {
  const upper = (sectorId || "").toUpperCase();
  return (
    ANIMAL_SECTORS[upper] || {
      id: sectorId,
      key: sectorId.toLowerCase(),
      name: sectorId,
      displayName: sectorId,
      pluralName: `${sectorId}s`,
      singularName: sectorId,
      icon: "🐾",
      color: "slate",
      enabled: true,
      terminology: {
        maleTerm: "Male",
        femaleTerm: "Female",
        youngTerm: "Young",
        identifierLabel: "Tag / Ring #",
        housingLabel: "Shelter / Pen",
        groupName: "Group",
      },
      modules: {
        registry: true,
        breeding: true,
        pedigree: true,
        health: true,
        feed: true,
        finance: true,
      },
      navigation: {
        registryHref: `/${sectorId.toLowerCase()}s`,
        breedingHref: `/${sectorId.toLowerCase()}s/breeding`,
        healthHref: `/${sectorId.toLowerCase()}s/health`,
        feedHref: `/${sectorId.toLowerCase()}s/feed`,
      },
    }
  );
}

export function getAllConfiguredSectors(): AnimalSectorConfig[] {
  return Object.values(ANIMAL_SECTORS);
}

export function getAllEnabledSectors(): AnimalSectorConfig[] {
  return Object.values(ANIMAL_SECTORS).filter((s) => s.enabled);
}

export function isSectorEnabled(sectorId: AnimalSectorId): boolean {
  const upper = (sectorId || "").toUpperCase();
  return Boolean(ANIMAL_SECTORS[upper]?.enabled);
}
