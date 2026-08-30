import { Pigeon } from "@/types/pigeon";
import { PedigreeNodeData } from "@/types/pedigree";
import { BreedingRound } from "@/types/breeding";
import { FlyingRecord } from "@/types/flying";
import { getPigeons } from "@/lib/repositories/pigeonRepository";
import { calculateHatchingStats, getBreedingRounds } from "@/lib/repositories/breedingRepository";
import { getFlyingRecords } from "@/lib/repositories/flyingRepository";

export async function buildPedigreeTree(
  rootPigeonId: string,
  maxGenerations: number = 3
): Promise<PedigreeNodeData | null> {
  const [pigeons, allRounds, allFlying] = await Promise.all([
    getPigeons().catch(() => []),
    getBreedingRounds().catch(() => []),
    getFlyingRecords().catch(() => []),
  ]);

  // Build O(1) fast lookup Hash Maps
  const pigeonMap = new Map<string, Pigeon>();
  pigeons.forEach((p) => pigeonMap.set(p.id, p));

  const rootPigeon = pigeonMap.get(rootPigeonId);
  if (!rootPigeon) return null;

  // Index breeding rounds by baby pigeon ID: O(R) time once, instead of O(R) per node
  const babyToRoundsMap = new Map<string, BreedingRound[]>();
  allRounds.forEach((round) => {
    if (Array.isArray(round.babyPigeonIds)) {
      round.babyPigeonIds.forEach((babyId) => {
        const list = babyToRoundsMap.get(babyId) || [];
        list.push(round);
        babyToRoundsMap.set(babyId, list);
      });
    }
  });

  // Index flying records by pigeon ID: O(F) time once
  const pigeonToFlightsMap = new Map<string, FlyingRecord[]>();
  allFlying.forEach((flight) => {
    const list = pigeonToFlightsMap.get(flight.pigeonId) || [];
    list.push(flight);
    pigeonToFlightsMap.set(flight.pigeonId, list);
  });

  function buildNode(
    pigeonId: string | null | undefined,
    currentGen: number,
    relation: string
  ): PedigreeNodeData {
    if (!pigeonId) {
      return {
        pigeon: null,
        generation: currentGen,
        relation,
      };
    }

    const pigeon = pigeonMap.get(pigeonId) || null;
    if (!pigeon) {
      return {
        pigeon: null,
        generation: currentGen,
        relation,
      };
    }

    // O(1) Hatching stats lookup
    const pigeonRounds = babyToRoundsMap.get(pigeon.id) || [];
    const hatchingStats = calculateHatchingStats(pigeonRounds);

    // O(1) Flying performance lookup
    const flights = pigeonToFlightsMap.get(pigeon.id) || [];
    const bestFlying = flights.length > 0 ? flights[0] : null;

    let fatherNode: PedigreeNodeData | null = null;
    let motherNode: PedigreeNodeData | null = null;

    if (currentGen < maxGenerations) {
      const fatherRel =
        relation === "Subject"
          ? "Father"
          : `${relation}'s Father`;
      const motherRel =
        relation === "Subject"
          ? "Mother"
          : `${relation}'s Mother`;

      fatherNode = buildNode(pigeon.fatherId, currentGen + 1, fatherRel);
      motherNode = buildNode(pigeon.motherId, currentGen + 1, motherRel);
    }

    return {
      pigeon,
      father: fatherNode,
      mother: motherNode,
      generation: currentGen,
      relation,
      hatchingStats,
      bestFlyingRecord: bestFlying,
    };
  }

  return buildNode(rootPigeon.id, 0, "Subject");
}
