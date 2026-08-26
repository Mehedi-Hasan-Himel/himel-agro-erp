import { Pigeon, PigeonStatus, PigeonSource, PigeonSex } from "@/types/pigeon";
import { notifyDataChanged } from "./storageAdapter";

export function generatePigeonId(ringYear: number, ringSerial: number): string {
  const serialStr = String(ringSerial).padStart(3, "0");
  return `pigeon_${ringYear}_${serialStr}`;
}

export async function getPigeons(): Promise<Pigeon[]> {
  const res = await fetch("/api/pigeons");
  if (!res.ok) throw new Error("Failed to fetch pigeons");
  return res.json();
}

export async function getPigeonById(id: string): Promise<Pigeon | null> {
  const res = await fetch(`/api/pigeons/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch pigeon ${id}`);
  return res.json();
}

export async function getPigeonByRing(
  ringYear: number,
  ringSerial: number,
  farmName = "Himel Agro"
): Promise<Pigeon | null> {
  const pigeons = await getPigeons();
  return (
    pigeons.find(
      (p) =>
        p.ringYear === ringYear &&
        p.ringSerial === ringSerial &&
        p.farmName.toLowerCase() === farmName.toLowerCase()
    ) || null
  );
}

export async function getPigeonChildren(parentId: string): Promise<Pigeon[]> {
  const pigeons = await getPigeons();
  return pigeons.filter(
    (p) => p.fatherId === parentId || p.motherId === parentId
  );
}

export interface CreatePigeonInput {
  id?: string;
  ringYear: number;
  ringSerial: number;
  farmName?: string;
  contactNumber?: string;
  hatchDate: string;
  sex: PigeonSex;
  breed: string;
  breedSubtype?: string;
  photoUrl?: string;
  fatherId?: string | null;
  motherId?: string | null;
  source: PigeonSource;
  purchaseDate?: string;
  purchasePrice?: number;
  seller?: string;
  status?: PigeonStatus;
  firstFlyingDate?: string;
  notes?: string;
}

export async function createPigeon(input: CreatePigeonInput): Promise<Pigeon> {
  const pigeons = await getPigeons();
  const farmName = input.farmName || "Himel Agro";
  const contactNumber = input.contactNumber || "01969038472";

  // Validate duplicate ring
  const existing = pigeons.find(
    (p) =>
      p.ringYear === input.ringYear &&
      p.ringSerial === input.ringSerial &&
      p.farmName.toLowerCase() === farmName.toLowerCase()
  );
  if (existing) {
    throw new Error(
      `Ring number ${input.ringYear} | ${farmName} | ${String(input.ringSerial).padStart(2, "0")} is already assigned to pigeon ID ${existing.id}.`
    );
  }

  // Validate hatch year equals ring year
  const hatchYear = new Date(input.hatchDate).getFullYear();
  if (hatchYear !== input.ringYear) {
    throw new Error(
      `Ring year (${input.ringYear}) must match the pigeon hatch year (${hatchYear}).`
    );
  }

  // Validate parents
  if (input.fatherId) {
    const father = pigeons.find((p) => p.id === input.fatherId);
    if (!father) {
      throw new Error(`Father pigeon with ID "${input.fatherId}" not found.`);
    }
    if (father.sex !== "MALE") {
      throw new Error(`Selected father (${father.id}) must be a MALE pigeon.`);
    }
  }

  if (input.motherId) {
    const mother = pigeons.find((p) => p.id === input.motherId);
    if (!mother) {
      throw new Error(`Mother pigeon with ID "${input.motherId}" not found.`);
    }
    if (mother.sex !== "FEMALE") {
      throw new Error(`Selected mother (${mother.id}) must be a FEMALE pigeon.`);
    }
  }

  const id = input.id || generatePigeonId(input.ringYear, input.ringSerial);
  const now = new Date().toISOString();

  const newPigeon: Pigeon = {
    id,
    ringYear: input.ringYear,
    ringSerial: input.ringSerial,
    farmName,
    contactNumber,
    hatchDate: input.hatchDate,
    sex: input.sex,
    breed: input.breed,
    breedSubtype: input.breedSubtype || "",
    photoUrl: input.photoUrl || "",
    fatherId: input.fatherId || null,
    motherId: input.motherId || null,
    source: input.source,
    purchaseDate: input.purchaseDate,
    purchasePrice: input.purchasePrice,
    seller: input.seller,
    status: input.status || "ACTIVE",
    firstFlyingDate: input.firstFlyingDate,
    notes: input.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  const res = await fetch("/api/pigeons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newPigeon, _id: id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create pigeon");
  }

  const created: Pigeon = await res.json();

  // If purchased with price, record financial transaction
  if (input.source === "PURCHASED" && input.purchasePrice && input.purchasePrice > 0) {
    try {
      const { createTransaction } = await import("./financeRepository");
      await createTransaction({
        type: "EXPENSE",
        date: input.purchaseDate || input.hatchDate || now.split("T")[0],
        category: "Pigeon Purchase",
        amount: input.purchasePrice,
        description: `Purchased Pigeon ${input.ringYear}-HAG-${String(input.ringSerial).padStart(2, "0")} (${input.breed}) from ${input.seller || "Seller"}`,
        pigeonId: id,
        notes: input.notes,
      });
    } catch (err) {
      console.warn("Failed to automatically create purchase transaction:", err);
    }
  }

  notifyDataChanged();
  return created;
}

export async function updatePigeon(
  id: string,
  data: Partial<Pigeon>
): Promise<Pigeon> {
  const pigeons = await getPigeons();
  const existing = pigeons.find((p) => p.id === id);
  if (!existing) {
    throw new Error(`Pigeon with ID "${id}" not found.`);
  }

  // Validate parents if changing
  if (data.fatherId && data.fatherId !== existing.fatherId) {
    if (data.fatherId === id) {
      throw new Error("A pigeon cannot be its own father.");
    }
    const father = pigeons.find((p) => p.id === data.fatherId);
    if (father && father.sex !== "MALE") {
      throw new Error(`Selected father (${father.id}) must be a MALE pigeon.`);
    }
  }

  if (data.motherId && data.motherId !== existing.motherId) {
    if (data.motherId === id) {
      throw new Error("A pigeon cannot be its own mother.");
    }
    const mother = pigeons.find((p) => p.id === data.motherId);
    if (mother && mother.sex !== "FEMALE") {
      throw new Error(`Selected mother (${mother.id}) must be a FEMALE pigeon.`);
    }
  }

  const updatePayload = { ...data, updatedAt: new Date().toISOString() };
  delete (updatePayload as Partial<Pigeon> & { id?: string }).id;

  const res = await fetch(`/api/pigeons/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update pigeon");
  }

  const updated: Pigeon = await res.json();
  notifyDataChanged();
  return updated;
}

export async function markPigeonSold(
  id: string,
  saleData: {
    saleDate: string;
    salePrice: number;
    buyer?: string;
    saleReason?: string;
    notes?: string;
  }
): Promise<Pigeon> {
  const pigeon = await getPigeonById(id);
  if (!pigeon) {
    throw new Error(`Pigeon with ID "${id}" not found.`);
  }

  const updated = await updatePigeon(id, {
    status: "SOLD",
    saleDate: saleData.saleDate,
    salePrice: saleData.salePrice,
    buyer: saleData.buyer || "",
    saleReason: saleData.saleReason || "",
    notes: saleData.notes
      ? `${pigeon.notes ? pigeon.notes + "\n" : ""}${saleData.notes}`
      : pigeon.notes,
  });

  // Record income transaction
  if (saleData.salePrice && saleData.salePrice > 0) {
    try {
      const { createTransaction } = await import("./financeRepository");
      await createTransaction({
        type: "INCOME",
        date: saleData.saleDate,
        category: "Pigeon Sale",
        amount: saleData.salePrice,
        description: `Sold Pigeon ${pigeon.ringYear}-HAG-${String(pigeon.ringSerial).padStart(2, "0")} to ${saleData.buyer || "Buyer"}`,
        pigeonId: id,
        notes: saleData.saleReason || saleData.notes,
      });
    } catch (err) {
      console.warn("Failed to create sale transaction:", err);
    }
  }

  return updated;
}

export async function markPigeonDead(
  id: string,
  deathData: {
    deathDate: string;
    deathReason: string;
    notes?: string;
  }
): Promise<Pigeon> {
  const pigeon = await getPigeonById(id);
  if (!pigeon) {
    throw new Error(`Pigeon with ID "${id}" not found.`);
  }

  return updatePigeon(id, {
    status: "DEAD",
    deathDate: deathData.deathDate,
    deathReason: deathData.deathReason,
    notes: deathData.notes
      ? `${pigeon.notes ? pigeon.notes + "\n" : ""}${deathData.notes}`
      : pigeon.notes,
  });
}

export async function markPigeonLost(
  id: string,
  lostData: {
    lostDate: string;
    lostNotes?: string;
  }
): Promise<Pigeon> {
  const pigeon = await getPigeonById(id);
  if (!pigeon) {
    throw new Error(`Pigeon with ID "${id}" not found.`);
  }

  return updatePigeon(id, {
    status: "LOST",
    lostDate: lostData.lostDate,
    lostNotes: lostData.lostNotes || "",
  });
}
