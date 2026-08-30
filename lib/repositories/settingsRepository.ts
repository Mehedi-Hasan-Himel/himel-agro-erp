import { FarmSettings } from "@/types/settings";
import { BreedConfig } from "@/types/breed";
import { notifyDataChanged, fetchWithCache } from "./storageAdapter";

export async function getSettings(): Promise<FarmSettings> {
  return fetchWithCache("settings", async () => {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
  });
}

export async function updateSettings(data: Partial<FarmSettings>): Promise<FarmSettings> {
  const current = await getSettings();
  const updated: FarmSettings = { ...current, ...data };

  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update settings");
  }

  const saved: FarmSettings = await res.json();
  notifyDataChanged();
  return saved;
}

export async function getBreeds(): Promise<BreedConfig> {
  return fetchWithCache("breeds_config", async () => {
    const res = await fetch("/api/breeds");
    if (!res.ok) throw new Error("Failed to fetch breeds");
    return res.json();
  });
}

export async function updateBreeds(config: BreedConfig): Promise<BreedConfig> {
  const res = await fetch("/api/breeds", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update breeds");
  }

  const saved: BreedConfig = await res.json();
  notifyDataChanged();
  return saved;
}

export async function addBreedSubtype(
  categoryName: string,
  newSubtype: string
): Promise<BreedConfig> {
  const config = await getBreeds();
  const trimmed = newSubtype.trim();
  if (!trimmed) return config;

  let cat = config.categories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (!cat) {
    cat = { name: categoryName, subtypes: [] };
    config.categories.push(cat);
  }

  if (!cat.subtypes.includes(trimmed)) {
    cat.subtypes.push(trimmed);
    return updateBreeds(config);
  }

  return config;
}
