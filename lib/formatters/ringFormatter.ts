export interface RingIdentifiable {
  ringYear: number;
  ringSerial: number;
  farmName?: string;
  contactNumber?: string;
}

/**
 * Full format: 2026 | Himel Agro | 01 | 01969038472
 */
export function formatRingNumber(pigeon?: RingIdentifiable | null): string {
  if (!pigeon) return "Unknown";
  const year = pigeon.ringYear || "----";
  const farm = pigeon.farmName || "Himel Agro";
  const serial = String(pigeon.ringSerial || 0).padStart(2, "0");
  const contact = pigeon.contactNumber || "01969038472";

  return `${year} | ${farm} | ${serial} | ${contact}`;
}

/**
 * Compact badge format: 2026-HAG-01
 */
export function formatCompactRing(pigeon?: RingIdentifiable | null): string {
  if (!pigeon) return "Unknown";
  const year = pigeon.ringYear || "----";
  const serial = String(pigeon.ringSerial || 0).padStart(2, "0");
  return `${year}-HAG-${serial}`;
}
