import { SITE_CONFIG } from "@/lib/config/siteConfig";

export interface RingIdentifiable {
  ringYear: number;
  ringSerial: number;
  farmName?: string;
  contactNumber?: string;
}

/**
 * Full format: 2026 | 01 | Himel's Pet House | 01560059954
 */
export function formatRingNumber(pigeon?: RingIdentifiable | null): string {
  if (!pigeon) return "Unknown";
  const year = pigeon.ringYear || "----";
  const farm = pigeon.farmName || SITE_CONFIG.shortName;
  const serial = String(pigeon.ringSerial || 0).padStart(2, "0");
  const contact = pigeon.contactNumber || SITE_CONFIG.contactNumber;

  return `${year} | ${serial} | ${farm} | ${contact}`;
}

/**
 * Compact badge & Unique ID format: 2026-09
 */
export function formatCompactRing(
  pigeon?: (RingIdentifiable & {
    id?: string;
    breed?: string;
    breedSubtype?: string;
    sex?: string;
  }) | null
): string {
  if (!pigeon) return "Unknown";
  if (pigeon.id) {
    return pigeon.id;
  }
  const year = pigeon.ringYear || "----";
  const serial = String(pigeon.ringSerial || 0).padStart(2, "0");
  const breedChar = (pigeon.breed === "Giribaz / Local" ? "Giribaz" : (pigeon.breed || "Giribaz"))
    .trim()
    .charAt(0)
    .toUpperCase() || "G";
  const subtypeChar = (pigeon.breedSubtype || "Standard").trim().charAt(0).toUpperCase() || "S";
  const sUpper = String(pigeon.sex || "").toUpperCase();
  const genderChar =
    sUpper === "MALE" || sUpper === "M"
      ? "M"
      : sUpper === "FEMALE" || sUpper === "F"
      ? "F"
      : "U";
  return `${year}-${serial}-${breedChar}${subtypeChar}${genderChar}`;
}
