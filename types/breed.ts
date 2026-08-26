export interface BreedCategory {
  name: string;
  subtypes: string[];
}

export interface BreedConfig {
  categories: BreedCategory[];
}
