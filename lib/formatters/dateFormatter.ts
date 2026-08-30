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

    let years = ref.getFullYear() - hatch.getFullYear();
    let months = ref.getMonth() - hatch.getMonth();
    let days = ref.getDate() - hatch.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(
        ref.getFullYear(),
        ref.getMonth(),
        0
      ).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) return "Just hatched";

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? "year" : "years"}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? "month" : "months"}`);
    }
    if (days > 0 || parts.length === 0) {
      parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    }

    return parts.join(", ");
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
