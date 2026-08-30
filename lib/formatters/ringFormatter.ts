import { SITE_CONFIG } from "@/lib/config/siteConfig";

export interface RingIdentifiable {
  ringYear: number;
  ringSerial: number;
  farmName?: string;
  contactNumber?: string;
}

/**
 * Full format: 2026 | Himel Agro | 01 | 01560059954
 */
export function formatRingNumber(pigeon?: RingIdentifiable | null): string {
  if (!pigeon) return "Unknown";
  const year = pigeon.ringYear || "----";
  const farm = pigeon.farmName || SITE_CONFIG.shortName;
  const serial = String(pigeon.ringSerial || 0).padStart(2, "0");
  const contact = pigeon.contactNumber || SITE_CONFIG.contactNumber;

  return `${year} | ${farm} | ${serial} | ${contact}`;
}

/**
 * Compact badge & Unique ID format: 2026-09
 */
export function formatCompactRing(pigeon?: (RingIdentifiable & { id?: string; breed?: string }) | null): string {
  if (!pigeon) return "Unknown";
  if (pigeon.id) {
    return pigeon.id;
  }
  const year = pigeon.ringYear || "----";
  const serial = String(pigeon.ringSerial || 0).padStart(2, "0");
  const breedChar = (pigeon.breed || "Giribaz").trim().charAt(0).toUpperCase() || "G";
  return `${year}-${serial}-${breedChar}`;
}
