import { Pair, BreedingRound, HatchingStats } from "@/types/breeding";
import { getItem, setItem } from "./storageAdapter";
import { getPigeonById, getPigeons } from "./pigeonRepository";

export async function getPairs(): Promise<Pair[]> {
  const pairs = getItem<Pair[]>("PAIRS");
  return [...pairs];
}

export async function getPairById(id: string): Promise<Pair | null> {
  const pairs = await getPairs();
  return pairs.find((p) => p.id === id) || null;
}

export async function getPairsForPigeon(pigeonId: string): Promise<Pair[]> {
  const pairs = await getPairs();
  return pairs.filter((p) => p.maleId === pigeonId || p.femaleId === pigeonId);
}

export async function getActivePairForPigeon(pigeonId: string): Promise<Pair | null> {
  const pairs = await getPairs();
  return (
    pairs.find(
      (p) =>
        p.status === "ACTIVE" &&
        (p.maleId === pigeonId || p.femaleId === pigeonId)
    ) || null
  );
}

export interface CreatePairInput {
  maleId: string;
  femaleId: string;
  startDate: string;
  endDate?: string | null;
  cageNumber?: string;
  notes?: string;
}

export async function createPair(input: CreatePairInput): Promise<Pair> {
  if (input.maleId === input.femaleId) {
    throw new Error("A pigeon cannot be paired with itself.");
  }

  const pigeons = await getPigeons();
  const male = pigeons.find((p) => p.id === input.maleId);
  const female = pigeons.find((p) => p.id === input.femaleId);

  if (!male) {
    throw new Error(`Male pigeon with ID "${input.maleId}" not found.`);
  }
  if (!female) {
    throw new Error(`Female pigeon with ID "${input.femaleId}" not found.`);
  }

  if (male.sex !== "MALE") {
    throw new Error(`Pigeon ${male.id} is not MALE.`);
  }
  if (female.sex !== "FEMALE") {
    throw new Error(`Pigeon ${female.id} is not FEMALE.`);
  }

  const pairs = await getPairs();
  const id = `pair_${new Date().getFullYear()}_${String(pairs.length + 1).padStart(2, "0")}`;
  const now = new Date().toISOString();

  const newPair: Pair = {
    id,
    maleId: input.maleId,
    femaleId: input.femaleId,
    startDate: input.startDate,
    endDate: input.endDate || null,
    status: "ACTIVE",
    cageNumber: input.cageNumber || "",
    notes: input.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  const updatedPairs = [newPair, ...pairs];
  setItem("PAIRS", updatedPairs);
  return newPair;
}

export async function updatePair(
  id: string,
  data: Partial<Pair>
): Promise<Pair> {
  const pairs = await getPairs();
  const index = pairs.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Pair with ID "${id}" not found.`);
  }

  const updated: Pair = {
    ...pairs[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  pairs[index] = updated;
  setItem("PAIRS", pairs);
  return updated;
}

export async function endPair(id: string, endDate?: string): Promise<Pair> {
  return updatePair(id, {
    status: "ENDED",
    endDate: endDate || new Date().toISOString().split("T")[0],
  });
}

// ----------------- BREEDING ROUNDS -----------------

export async function getBreedingRounds(pairId?: string): Promise<BreedingRound[]> {
  const rounds = getItem<BreedingRound[]>("BREEDING_ROUNDS");
  if (pairId) {
    return rounds.filter((r) => r.pairId === pairId);
  }
  return [...rounds];
}

export async function getBreedingRoundById(id: string): Promise<BreedingRound | null> {
  const rounds = await getBreedingRounds();
  return rounds.find((r) => r.id === id) || null;
}

export async function getBreedingRoundsForPigeon(pigeonId: string): Promise<BreedingRound[]> {
  const pairs = await getPairsForPigeon(pigeonId);
  const pairIds = new Set(pairs.map((p) => p.id));
  const allRounds = await getBreedingRounds();
  return allRounds.filter((r) => pairIds.has(r.pairId));
}

export interface CreateBreedingRoundInput {
  pairId: string;
  roundNumber?: number;
  date?: string;
  hatchDate?: string;
  eggsLaid: number;
  babiesHatched: number;
  babyPigeonIds?: string[];
  notes?: string;
}

export async function createBreedingRound(
  input: CreateBreedingRoundInput
): Promise<BreedingRound> {
  const allRounds = await getBreedingRounds();
  const pairRounds = allRounds.filter((r) => r.pairId === input.pairId);

  const roundNumber = input.roundNumber || pairRounds.length + 1;
  const id = `round_${input.pairId}_${String(roundNumber).padStart(2, "0")}`;
  const now = new Date().toISOString();

  if (input.babiesHatched > input.eggsLaid) {
    throw new Error(
      `Babies hatched (${input.babiesHatched}) cannot exceed eggs laid (${input.eggsLaid}).`
    );
  }

  const newRound: BreedingRound = {
    id,
    pairId: input.pairId,
    roundNumber,
    date: input.date || now.split("T")[0],
    hatchDate: input.hatchDate,
    eggsLaid: input.eggsLaid,
    babiesHatched: input.babiesHatched,
    babyPigeonIds: input.babyPigeonIds || [],
    notes: input.notes || "",
    createdAt: now,
  };

  const updatedRounds = [newRound, ...allRounds];
  setItem("BREEDING_ROUNDS", updatedRounds);
  return newRound;
}

export async function updateBreedingRound(
  id: string,
  data: Partial<BreedingRound>
): Promise<BreedingRound> {
  const rounds = await getBreedingRounds();
  const index = rounds.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error(`Breeding round with ID "${id}" not found.`);
  }

  const updated: BreedingRound = {
    ...rounds[index],
    ...data,
  };

  rounds[index] = updated;
  setItem("BREEDING_ROUNDS", rounds);
  return updated;
}

export async function addBabyToBreedingRound(
  roundId: string,
  babyPigeonId: string
): Promise<BreedingRound> {
  const round = await getBreedingRoundById(roundId);
  if (!round) {
    throw new Error(`Breeding round with ID "${roundId}" not found.`);
  }

  const existingBabies = round.babyPigeonIds || [];
  if (!existingBabies.includes(babyPigeonId)) {
    const updated = await updateBreedingRound(roundId, {
      babyPigeonIds: [...existingBabies, babyPigeonId],
      babiesHatched: Math.max(round.babiesHatched, existingBabies.length + 1),
    });
    return updated;
  }
  return round;
}

// ----------------- HATCHING RATE CALCULATIONS -----------------

export function calculateHatchingStats(rounds: BreedingRound[]): HatchingStats {
  const totalRounds = rounds.length;
  const totalEggs = rounds.reduce((sum, r) => sum + (r.eggsLaid || 0), 0);
  const totalHatched = rounds.reduce((sum, r) => sum + (r.babiesHatched || 0), 0);
  const hatchingRate =
    totalEggs > 0 ? Math.round((totalHatched / totalEggs) * 1000) / 10 : 0;

  return {
    totalRounds,
    totalEggs,
    totalHatched,
    hatchingRate,
  };
}

export async function getPigeonHatchingStats(pigeonId: string): Promise<HatchingStats> {
  const rounds = await getBreedingRoundsForPigeon(pigeonId);
  return calculateHatchingStats(rounds);
}

export async function getPairHatchingStats(pairId: string): Promise<HatchingStats> {
  const rounds = await getBreedingRounds(pairId);
  return calculateHatchingStats(rounds);
}
