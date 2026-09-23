import { Pigeon } from "@/types/pigeon";

export interface FarmPigeonStats {
  totalHistorical: number;
  totalActive: number;
  keptBirds: number;
  racersCount: number;
  giribazCount: number;
  activeMales: number;
  activeFemales: number;
  activeBabies: number;
  activeYoungNA: number;
  soldCount: number;
  deadCount: number;
  lostCount: number;
  availableForSale: number;
  breedDistribution: Record<string, number>;
}

export function calculatePigeonStats(pigeons: Pigeon[]): FarmPigeonStats {
  let totalActive = 0;
  let activeMales = 0;
  let activeFemales = 0;
  let activeYoungNA = 0;
  let soldCount = 0;
  let deadCount = 0;
  let lostCount = 0;
  let availableForSale = 0;
  let racersCount = 0;
  let giribazCount = 0;
  const breedDistribution: Record<string, number> = {};

  pigeons.forEach((p) => {
    // Breed stats
    const breedKey = p.breed || "Other";
    breedDistribution[breedKey] = (breedDistribution[breedKey] || 0) + 1;

    if (p.status === "SOLD") {
      soldCount += 1;
      return;
    }
    if (p.status === "DEAD") {
      deadCount += 1;
      return;
    }
    if (
      p.status === "LOST" ||
      p.notes?.toLowerCase().includes("ring lost") ||
      p.breedSubtype?.toLowerCase().includes("ring lost")
    ) {
      lostCount += 1;
      return;
    }

    // ACTIVE / KEPT BIRDS IN LOFT
    totalActive += 1;

    const breedLower = (p.breed || "").toLowerCase();
    if (breedLower.includes("racer")) {
      racersCount += 1;
    } else if (breedLower.includes("giribaz")) {
      giribazCount += 1;
    }

    const sexUpper = (p.sex || "").toUpperCase();
    if (sexUpper === "MALE") {
      activeMales += 1;
    } else if (sexUpper === "FEMALE") {
      activeFemales += 1;
    } else {
      activeYoungNA += 1;
    }

    // Available for sale logic: active birds marked as for sale
    if (
      p.status === "ACTIVE" &&
      (p.isForSale === true ||
        p.notes?.toLowerCase().includes("[for_sale]") ||
        p.notes?.toLowerCase().includes("for sale"))
    ) {
      availableForSale += 1;
    }
  });

  return {
    totalHistorical: pigeons.length,
    totalActive,
    keptBirds: totalActive,
    racersCount,
    giribazCount,
    activeMales,
    activeFemales,
    activeBabies: activeYoungNA,
    activeYoungNA,
    soldCount,
    deadCount,
    lostCount,
    availableForSale,
    breedDistribution,
  };
}
