import { Pigeon } from "@/types/pigeon";
import { PedigreeNodeData } from "@/types/pedigree";
import { getPigeons } from "@/lib/repositories/pigeonRepository";
import { getBreedingRoundsForPigeon, calculateHatchingStats } from "@/lib/repositories/breedingRepository";
import { getFlyingRecords } from "@/lib/repositories/flyingRepository";

export async function buildPedigreeTree(
  rootPigeonId: string,
  maxGenerations: number = 3
): Promise<PedigreeNodeData | null> {
  const pigeons = await getPigeons();
  const pigeonMap = new Map<string, Pigeon>();
  pigeons.forEach((p) => pigeonMap.set(p.id, p));

  const rootPigeon = pigeonMap.get(rootPigeonId);
  if (!rootPigeon) return null;

  const allRounds = await (async () => {
    try {
      const { getBreedingRounds } = await import("@/lib/repositories/breedingRepository");
      return await getBreedingRounds();
    } catch {
      return [];
    }
  })();

  const allFlying = await getFlyingRecords();

  async function buildNode(
    pigeonId: string | null | undefined,
    currentGen: number,
    relation: string
  ): Promise<PedigreeNodeData> {
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

    // Hatching stats for this pigeon
    const pigeonRounds = allRounds.filter(
      (r) => r.babyPigeonIds?.includes(pigeon.id) || false
    );
    const hatchingStats = calculateHatchingStats(pigeonRounds);

    // Flying performance
    const flights = allFlying.filter((f) => f.pigeonId === pigeon.id);
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

      fatherNode = await buildNode(pigeon.fatherId, currentGen + 1, fatherRel);
      motherNode = await buildNode(pigeon.motherId, currentGen + 1, motherRel);
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
