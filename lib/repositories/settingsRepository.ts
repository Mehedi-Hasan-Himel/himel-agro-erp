import { FarmSettings } from "@/types/settings";
import { BreedConfig } from "@/types/breed";
import { getItem, setItem } from "./storageAdapter";

export async function getSettings(): Promise<FarmSettings> {
  const settings = getItem<FarmSettings>("SETTINGS");
  return { ...settings };
}

export async function updateSettings(data: Partial<FarmSettings>): Promise<FarmSettings> {
  const settings = await getSettings();
  const updated: FarmSettings = {
    ...settings,
    ...data,
  };
  setItem("SETTINGS", updated);
  return updated;
}

export async function getBreeds(): Promise<BreedConfig> {
  const breeds = getItem<BreedConfig>("BREEDS");
  return { ...breeds };
}

export async function updateBreeds(config: BreedConfig): Promise<BreedConfig> {
  setItem("BREEDS", config);
  return config;
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
    setItem("BREEDS", config);
  }

  return config;
}
