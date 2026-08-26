import { Pigeon } from "./pigeon";
import { HatchingStats } from "./breeding";
import { FlyingRecord } from "./flying";

export interface PedigreeNodeData {
  pigeon: Pigeon | null;
  father?: PedigreeNodeData | null;
  mother?: PedigreeNodeData | null;
  generation: number; // 0 = root/subject, 1 = parents, 2 = grandparents, 3 = great-grandparents
  relation: string; // "Subject", "Father", "Mother", "Father's Father", etc.
  hatchingStats?: HatchingStats;
  bestFlyingRecord?: FlyingRecord | null;
}
