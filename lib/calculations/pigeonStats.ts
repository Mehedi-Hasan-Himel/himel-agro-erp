import { Pigeon } from "@/types/pigeon";
import { isBabyPigeon } from "@/lib/formatters/dateFormatter";

export interface FarmPigeonStats {
  totalHistorical: number;
  totalActive: number;
  activeMales: number;
  activeFemales: number;
  activeBabies: number;
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
  let activeBabies = 0;
  let soldCount = 0;
  let deadCount = 0;
  let lostCount = 0;
  let availableForSale = 0;
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
    if (p.status === "LOST") {
      lostCount += 1;
      return;
    }

    // ACTIVE
    totalActive += 1;

    const isBaby = isBabyPigeon(p.hatchDate, p.sex);

    if (isBaby) {
      activeBabies += 1;
    } else if (p.sex === "MALE") {
      activeMales += 1;
    } else if (p.sex === "FEMALE") {
      activeFemales += 1;
    } else {
      activeBabies += 1;
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
    activeMales,
    activeFemales,
    activeBabies,
    soldCount,
    deadCount,
    lostCount,
    availableForSale,
    breedDistribution,
  };
}
