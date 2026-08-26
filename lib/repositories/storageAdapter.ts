// DATA_CHANGE_EVENT — used by all pages to trigger data refresh after mutations
export const DATA_CHANGE_EVENT = "himel-agro-data-updated";

export function notifyDataChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
}

// Export all data from MongoDB as a JSON backup
export async function exportAllData(): Promise<string> {
  const res = await fetch("/api/seed");
  if (!res.ok) throw new Error("Failed to export data from MongoDB");
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}

// Import data into MongoDB from a JSON backup string
export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    const res = await fetch("/api/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    if (!res.ok) return false;
    notifyDataChanged();
    return true;
  } catch (err) {
    console.error("Failed to import data:", err);
    return false;
  }
}

// Reset MongoDB to the original demo seed data
export async function resetToSeedData(): Promise<void> {
  const res = await fetch("/api/seed?reset=true", { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset seed data");
  notifyDataChanged();
}

