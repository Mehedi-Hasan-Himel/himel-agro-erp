export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

export function calculateAge(
  hatchDateStr?: string | null,
  referenceDateStr?: string
): string {
  if (!hatchDateStr) return "Unknown";
  try {
    const hatch = new Date(hatchDateStr);
    const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
    if (isNaN(hatch.getTime())) return "Unknown";

    let months =
      (ref.getFullYear() - hatch.getFullYear()) * 12 +
      (ref.getMonth() - hatch.getMonth());
    if (ref.getDate() < hatch.getDate()) {
      months -= 1;
    }

    if (months < 0) return "Just hatched";
    if (months === 0) {
      const days = Math.floor(
        (ref.getTime() - hatch.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `${Math.max(1, days)} days`;
    }
    if (months < 12) {
      return `${months} ${months === 1 ? "month" : "months"}`;
    }

    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (remMonths === 0) {
      return `${years} ${years === 1 ? "yr" : "yrs"}`;
    }
    return `${years} yr ${remMonths} mo`;
  } catch {
    return "Unknown";
  }
}

export function isBabyPigeon(
  hatchDateStr?: string | null,
  sex?: string
): boolean {
  if (sex === "UNKNOWN") return true;
  if (!hatchDateStr) return false;
  try {
    const hatch = new Date(hatchDateStr);
    const now = new Date();
    const months =
      (now.getFullYear() - hatch.getFullYear()) * 12 +
      (now.getMonth() - hatch.getMonth());
    return months < 4; // Pigeons under 4 months are squabs/babies
  } catch {
    return false;
  }
}
