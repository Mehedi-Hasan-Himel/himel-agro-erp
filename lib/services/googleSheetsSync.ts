import { connectDB } from "@/lib/mongodb";
import PigeonModel, { IPigeon } from "@/models/Pigeon";
import TransactionModel, { ITransaction } from "@/models/Transaction";
import AppConfigModel from "@/models/AppConfig";
import { fallbackStore } from "@/lib/fallbackStore";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import {
  GoogleSheetPigeonRow,
  GoogleSheetFinanceRow,
  GoogleSheetsSyncResult,
  GoogleSheetsFinanceSyncResult,
  DualSheetSyncResult,
  DEFAULT_PIGEONS_SHEET_URL,
  DEFAULT_FINANCE_SHEET_URL,
  DEFAULT_GOOGLE_SHEET_URL,
} from "@/types/googleSheets";

export { DEFAULT_PIGEONS_SHEET_URL, DEFAULT_FINANCE_SHEET_URL, DEFAULT_GOOGLE_SHEET_URL };

/**
 * Extracts Google Spreadsheet ID from various URL formats or bare ID.
 */
export function extractSpreadsheetId(inputUrl: string): string | null {
  if (!inputUrl || typeof inputUrl !== "string") return null;
  const trimmed = inputUrl.trim();

  // If it's just the ID
  if (/^[a-zA-Z0-9-_]{25,}$/.test(trimmed)) {
    return trimmed;
  }

  // Matching /d/SPREADSHEET_ID
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Parses ring number string (e.g. "01--2026", "02-2026", "2026-05", "15")
 */
export function parseRingNumber(raw: string): {
  officialRingNumber: string;
  ringSerial: number;
  ringYear: number;
} {
  const clean = (raw || "").trim();
  const currentYear = new Date().getFullYear();

  // Pattern: 01--2026 or 01-2026 or 1/2026
  const matchSuffixYear = clean.match(/^0*(\d+)\s*[-/]+\s*(\d{4})$/);
  if (matchSuffixYear) {
    return {
      officialRingNumber: clean,
      ringSerial: parseInt(matchSuffixYear[1], 10) || 1,
      ringYear: parseInt(matchSuffixYear[2], 10) || currentYear,
    };
  }

  // Pattern: 2026-01 or 2026/1
  const matchPrefixYear = clean.match(/^(\d{4})\s*[-/]+\s*0*(\d+)$/);
  if (matchPrefixYear) {
    return {
      officialRingNumber: clean,
      ringSerial: parseInt(matchPrefixYear[2], 10) || 1,
      ringYear: parseInt(matchPrefixYear[1], 10) || currentYear,
    };
  }

  // Single number like "01" or "15"
  const matchNumber = clean.match(/^0*(\d+)$/);
  if (matchNumber) {
    const serial = parseInt(matchNumber[1], 10) || 1;
    return {
      officialRingNumber: `${String(serial).padStart(2, "0")}--${currentYear}`,
      ringSerial: serial,
      ringYear: currentYear,
    };
  }

  // Fallback
  return {
    officialRingNumber: clean || `01--${currentYear}`,
    ringSerial: 1,
    ringYear: currentYear,
  };
}

/**
 * Normalizes month names or dates into ISO YYYY-MM-DD.
 */
export function parseHatchDate(raw: string, defaultYear = 2026): string {
  if (!raw) return `${defaultYear}-04-01`;
  const clean = raw.trim();

  // Check if standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  const months: Record<string, string> = {
    january: "01",
    jan: "01",
    february: "02",
    feb: "02",
    march: "03",
    mar: "03",
    april: "04",
    apr: "04",
    may: "05",
    june: "06",
    jun: "06",
    july: "07",
    jul: "07",
    august: "08",
    aug: "08",
    september: "09",
    sep: "09",
    sept: "09",
    october: "10",
    oct: "10",
    november: "11",
    nov: "11",
    december: "12",
    dec: "12",
  };

  const lower = clean.toLowerCase();
  for (const [mName, mNum] of Object.entries(months)) {
    if (lower.startsWith(mName)) {
      return `${defaultYear}-${mNum}-01`;
    }
  }

  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return `${defaultYear}-04-01`;
}

/**
 * Normalizes Gender from sheet ("Hen / Female", "Cock / Male", etc.)
 */
export function parseGender(raw?: string): "MALE" | "FEMALE" | "UNKNOWN" {
  if (!raw) return "UNKNOWN";
  const lower = raw.trim().toLowerCase();
  if (lower.includes("hen") || lower.includes("female") || lower === "f") {
    return "FEMALE";
  }
  if (lower.includes("cock") || lower.includes("male") || lower === "m") {
    return "MALE";
  }
  return "UNKNOWN";
}

/**
 * Normalizes Pigeon Status from sheet ("Kept", "Lost", "Dead", etc.)
 */
export function parseStatus(
  statusRaw?: string,
  notesRaw?: string
): "ACTIVE" | "SOLD" | "DEAD" | "LOST" {
  const combined = `${statusRaw || ""} ${notesRaw || ""}`.toLowerCase();
  if (combined.includes("lost")) return "LOST";
  if (combined.includes("dead") || combined.includes("died")) return "DEAD";
  if (combined.includes("sold")) return "SOLD";
  return "ACTIVE";
}

/**
 * Normalizes breed and category.
 */
export function parseBreedAndCategory(
  breedRaw?: string,
  categoryRaw?: string
): { breed: string; breedSubtype: string } {
  let breed = (breedRaw || "").trim();
  let category = (categoryRaw || "").trim();

  // If breed is empty and category is "Ring Lost", default to Giribaz
  if (!breed) {
    if (category.toLowerCase().includes("racer")) {
      breed = "Racer";
    } else {
      breed = "Giribaz";
    }
  }

  if (breed.toLowerCase().includes("racer") || breed.toLowerCase().includes("racing")) {
    breed = "Racer";
  } else if (breed.toLowerCase().includes("giri")) {
    breed = "Giribaz";
  }

  if (!category) {
    category = breed === "Racer" ? "Racing Homer" : "Standard Giribaz";
  }

  return { breed, breedSubtype: category };
}

/**
 * Generates canonical ID conforming to the app standard.
 */
function buildCanonicalId(
  ringYear: number,
  ringSerial: number,
  breed: string,
  breedSubtype: string,
  sex: string
): string {
  const year = ringYear || 2026;
  const serialStr = String(ringSerial || 1).padStart(2, "0");
  const breedChar = (breed || "Giribaz").trim().charAt(0).toUpperCase() || "G";
  const subtypeChar = (breedSubtype || "Standard").trim().charAt(0).toUpperCase() || "S";
  const sUpper = String(sex || "").toUpperCase();
  const genderChar =
    sUpper === "MALE" || sUpper === "M"
      ? "M"
      : sUpper === "FEMALE" || sUpper === "F"
      ? "F"
      : "U";
  return `${year}-${serialStr}-${breedChar}${subtypeChar}${genderChar}`;
}

/**
 * Fetches rows from Google Sheet using Google Visualization API with CSV fallback.
 */
export async function fetchGoogleSheetData(
  sheetUrl: string
): Promise<GoogleSheetPigeonRow[]> {
  const spreadsheetId = extractSpreadsheetId(sheetUrl);
  if (!spreadsheetId) {
    throw new Error(
      "Invalid Google Sheet URL. Could not extract Google Spreadsheet ID."
    );
  }

  // 1. Try Google Visualization API endpoint (returns structured JSON)
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

  try {
    const res = await fetch(gvizUrl, { cache: "no-store" });
    if (res.ok) {
      const text = await res.text();
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = text.substring(firstBrace, lastBrace + 1);
        const data = JSON.parse(jsonStr);

        if (data && data.table && Array.isArray(data.table.rows)) {
          const cols: string[] = (data.table.cols || []).map((c: { label?: string }) =>
            (c.label || "").trim().toLowerCase()
          );

          // Find column indices
          const findCol = (keywords: string[]): number => {
            return cols.findIndex((col) =>
              keywords.some((kw) => col.includes(kw.toLowerCase()))
            );
          };

          const colRing = findCol(["ring number", "ring", "ring_number"]);
          const colCategory = findCol(["category", "subtype"]);
          const colBreed = findCol(["breed"]);
          const colHatchDate = findCol(["hatch date", "hatch", "birth"]);
          const colColor = findCol(["color/pattern", "color", "pattern"]);
          const colGender = findCol(["gender", "sex"]);
          const colStatus = findCol(["status"]);
          const colNotes = findCol(["notes", "note"]);
          const colFather = findCol(["father", "sire"]);
          const colMother = findCol(["mother", "dam"]);
          const colHomeRace = findCol(["home race", "race"]);
          const colReturnSpeed = findCol(["return speed", "speed"]);
          const colPotentialGrade = findCol(["potential grade", "grade"]);

          const rows: GoogleSheetPigeonRow[] = [];

          for (const r of data.table.rows) {
            const cells = r.c || [];
            const getVal = (idx: number): string => {
              if (idx < 0 || idx >= cells.length || !cells[idx]) return "";
              const val = cells[idx].v !== undefined ? cells[idx].v : cells[idx].f;
              return val !== null && val !== undefined ? String(val).trim() : "";
            };

            const ringNumber = getVal(colRing !== -1 ? colRing : 0);
            if (!ringNumber || ringNumber.toLowerCase().includes("ring number")) {
              continue; // skip header or empty
            }

            rows.push({
              ringNumber,
              category: getVal(colCategory !== -1 ? colCategory : 1),
              breed: getVal(colBreed !== -1 ? colBreed : 2),
              hatchDate: getVal(colHatchDate !== -1 ? colHatchDate : 3),
              colorPattern: getVal(colColor !== -1 ? colColor : 4),
              gender: getVal(colGender !== -1 ? colGender : 5),
              status: getVal(colStatus !== -1 ? colStatus : 6),
              notes: getVal(colNotes !== -1 ? colNotes : 7),
              father: getVal(colFather !== -1 ? colFather : 8),
              mother: getVal(colMother !== -1 ? colMother : 9),
              homeRaceKm: colHomeRace !== -1 ? getVal(colHomeRace) : "",
              returnSpeed: colReturnSpeed !== -1 ? getVal(colReturnSpeed) : "",
              potentialGrade: colPotentialGrade !== -1 ? getVal(colPotentialGrade) : "",
            });
          }

          if (rows.length > 0) {
            return rows;
          }
        }
      }
    }
  } catch (err) {
    console.warn("GViz API fetch failed, falling back to CSV export:", err);
  }

  // 2. Fallback to CSV export endpoint
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
  const csvRes = await fetch(csvUrl, { cache: "no-store" });
  if (!csvRes.ok) {
    throw new Error(`Failed to fetch Google Sheet via CSV (Status ${csvRes.status})`);
  }

  const csvText = await csvRes.text();
  return parseCsvToRows(csvText);
}

/**
 * Fallback parser for standard CSV content with quote handling.
 */
function parseCsvToRows(csv: string): GoogleSheetPigeonRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const splitCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const findIdx = (keywords: string[]) =>
    header.findIndex((h) => keywords.some((k) => h.includes(k)));

  const colRing = findIdx(["ring number", "ring"]);
  const colCategory = findIdx(["category", "subtype"]);
  const colBreed = findIdx(["breed"]);
  const colHatchDate = findIdx(["hatch date", "hatch"]);
  const colColor = findIdx(["color/pattern", "color"]);
  const colGender = findIdx(["gender", "sex"]);
  const colStatus = findIdx(["status"]);
  const colNotes = findIdx(["notes", "note"]);
  const colFather = findIdx(["father", "sire"]);
  const colMother = findIdx(["mother", "dam"]);
  const colGrade = findIdx(["potential grade", "grade"]);

  const rows: GoogleSheetPigeonRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const ringNumber = cols[colRing !== -1 ? colRing : 0] || "";
    if (!ringNumber || ringNumber.toLowerCase().includes("ring")) continue;

    rows.push({
      ringNumber,
      category: cols[colCategory !== -1 ? colCategory : 1] || "",
      breed: cols[colBreed !== -1 ? colBreed : 2] || "",
      hatchDate: cols[colHatchDate !== -1 ? colHatchDate : 3] || "",
      colorPattern: cols[colColor !== -1 ? colColor : 4] || "",
      gender: cols[colGender !== -1 ? colGender : 5] || "",
      status: cols[colStatus !== -1 ? colStatus : 6] || "",
      notes: cols[colNotes !== -1 ? colNotes : 7] || "",
      father: cols[colFather !== -1 ? colFather : 8] || "",
      mother: cols[colMother !== -1 ? colMother : 9] || "",
      potentialGrade: colGrade !== -1 ? cols[colGrade] : "",
    });
  }

  return rows;
}

/**
 * Main synchronizer: Fetches live sheet rows, maps to IPigeon model, and persists to MongoDB / fallbackStore.
 */
export async function syncGoogleSheetToDatabase(
  customSheetUrl?: string
): Promise<GoogleSheetsSyncResult> {
  const sheetUrl = customSheetUrl || DEFAULT_GOOGLE_SHEET_URL;
  const spreadsheetId = extractSpreadsheetId(sheetUrl) || "";

  if (!spreadsheetId) {
    return {
      success: false,
      message: "Invalid Google Sheet URL provided.",
      timestamp: new Date().toISOString(),
      sheetUrl,
      spreadsheetId: "",
      totalRows: 0,
      addedCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      errors: ["Could not extract spreadsheet ID"],
    };
  }

  const timestamp = new Date().toISOString();
  const errors: string[] = [];
  let totalRows = 0;
  let addedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  try {
    const sheetRows = await fetchGoogleSheetData(sheetUrl);
    totalRows = sheetRows.length;

    if (totalRows === 0) {
      return {
        success: false,
        message: "No pigeon rows found in Google Sheet.",
        timestamp,
        sheetUrl,
        spreadsheetId,
        totalRows: 0,
        addedCount: 0,
        updatedCount: 0,
        unchangedCount: 0,
        errors: ["Sheet returned 0 rows"],
      };
    }

    const db = await connectDB();

    // Fetch existing pigeons
    let existingPigeons: IPigeon[] = [];
    if (db) {
      existingPigeons = (await PigeonModel.find({}).lean()) as unknown as IPigeon[];
    } else {
      existingPigeons = fallbackStore.get().pigeons as unknown as IPigeon[];
    }

    const updatedPigeonsList: IPigeon[] = [...existingPigeons];

    for (const row of sheetRows) {
      try {
        const ringInfo = parseRingNumber(row.ringNumber);
        const { breed, breedSubtype } = parseBreedAndCategory(
          row.breed,
          row.category
        );
        const hatchDate = parseHatchDate(row.hatchDate || "", ringInfo.ringYear);
        const sex = parseGender(row.gender);
        const status = parseStatus(row.status, row.notes);
        const notes = (row.notes || "").trim();
        const colorPattern = (row.colorPattern || "").trim();
        const fatherDetails = (row.father || "").trim();
        const motherDetails = (row.mother || "").trim();
        const potentialGrade =
          row.potentialGrade && row.potentialGrade.toUpperCase() !== "NA"
            ? row.potentialGrade.trim()
            : "";

        // Match existing pigeon by (ringYear + ringSerial) or officialRingNumber
        const existingIdx = updatedPigeonsList.findIndex((p) => {
          if (
            p.ringYear === ringInfo.ringYear &&
            p.ringSerial === ringInfo.ringSerial
          ) {
            return true;
          }
          if (
            p.officialRingNumber &&
            p.officialRingNumber.toLowerCase() ===
              ringInfo.officialRingNumber.toLowerCase()
          ) {
            return true;
          }
          return false;
        });

        if (existingIdx !== -1) {
          const existing = updatedPigeonsList[existingIdx];

          // Check if any field actually changed
          const hasChanged =
            existing.officialRingNumber !== ringInfo.officialRingNumber ||
            existing.breed !== breed ||
            existing.breedSubtype !== breedSubtype ||
            existing.colorPattern !== colorPattern ||
            existing.sex !== sex ||
            existing.status !== status ||
            existing.notes !== notes ||
            existing.fatherDetails !== fatherDetails ||
            existing.motherDetails !== motherDetails ||
            existing.potentialGrade !== potentialGrade;

          const updatedDoc: IPigeon = {
            ...existing,
            officialRingNumber: ringInfo.officialRingNumber,
            ringSerial: ringInfo.ringSerial,
            ringYear: ringInfo.ringYear,
            breed,
            breedSubtype,
            colorPattern,
            sex,
            status,
            notes: notes,
            hatchDate: hatchDate || existing.hatchDate,
            fatherDetails: fatherDetails,
            motherDetails: motherDetails,
            potentialGrade: potentialGrade,
            updatedAt: timestamp,
          };

          updatedPigeonsList[existingIdx] = updatedDoc;

          if (db) {
            await PigeonModel.findByIdAndUpdate(existing._id, updatedDoc, {
              upsert: true,
              new: true,
            });
          }

          if (hasChanged) {
            updatedCount++;
          } else {
            unchangedCount++;
          }
        } else {
          // New pigeon
          const newId = buildCanonicalId(
            ringInfo.ringYear,
            ringInfo.ringSerial,
            breed,
            breedSubtype,
            sex
          );

          const newDoc: IPigeon = {
            _id: newId,
            id: newId,
            ringYear: ringInfo.ringYear,
            ringSerial: ringInfo.ringSerial,
            officialRingNumber: ringInfo.officialRingNumber,
            farmName: SITE_CONFIG.farmName,
            contactNumber: SITE_CONFIG.contactNumber,
            hatchDate,
            sex,
            breed,
            breedSubtype,
            colorPattern,
            fatherDetails,
            motherDetails,
            potentialGrade,
            source: "BORN_HIMEL_AGRO",
            status,
            notes,
            photos: [],
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          updatedPigeonsList.unshift(newDoc);

          if (db) {
            const pigeon = new PigeonModel(newDoc);
            await pigeon.save();
          }

          addedCount++;
        }
      } catch (err) {
        const msg = `Row ${row.ringNumber}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
      }
    }

    // Sort pigeons in exact canonical ring serial order (01--2026 to 15--2026)
    updatedPigeonsList.sort((a, b) => a.ringSerial - b.ringSerial);

    // Persist to data/pigeons.json on disk for consistency across reloads
    try {
      const fs = await import("fs");
      const path = await import("path");
      const pigeonsFilePath = path.join(process.cwd(), "data", "pigeons.json");
      fs.writeFileSync(
        pigeonsFilePath,
        JSON.stringify(updatedPigeonsList, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.warn("Could not persist pigeons to disk:", e);
    }

    // Save sync metadata
    const syncMeta = {
      sheetUrl,
      pigeonsSheetUrl: sheetUrl,
      lastSyncedAt: timestamp,
      lastSyncStatus: "SUCCESS",
      lastSyncMessage: `Synced ${totalRows} pigeons (${addedCount} added, ${updatedCount} updated, ${unchangedCount} unchanged)`,
      totalSynced: totalRows,
    };

    // Update fallback store memory
    const storeSettings = (fallbackStore.get().settings as Record<string, unknown>) || {};
    fallbackStore.set({
      pigeons: updatedPigeonsList as unknown as Record<string, unknown>[],
      settings: { ...storeSettings, ...syncMeta },
    });

    if (db) {
      await AppConfigModel.findByIdAndUpdate(
        "GOOGLE_SHEETS_CONFIG" as unknown,
        { _id: "GOOGLE_SHEETS_CONFIG", data: syncMeta },
        { upsert: true }
      );
    }

    return {
      success: true,
      message: `Successfully synchronized ${totalRows} pigeons from Google Sheet. (${addedCount} added, ${updatedCount} updated, ${unchangedCount} unchanged)`,
      timestamp,
      sheetUrl,
      spreadsheetId,
      totalRows,
      addedCount,
      updatedCount,
      unchangedCount,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Sync failed";
    return {
      success: false,
      message: errorMsg,
      timestamp,
      sheetUrl,
      spreadsheetId,
      totalRows,
      addedCount,
      updatedCount,
      unchangedCount,
      errors: [errorMsg],
    };
  }
}

/**
 * Fetches rows from Google Sheet for Finance & Accounts.
 */
export async function fetchGoogleSheetFinanceData(
  sheetUrl: string
): Promise<GoogleSheetFinanceRow[]> {
  const spreadsheetId = extractSpreadsheetId(sheetUrl);
  if (!spreadsheetId) {
    throw new Error("Invalid Google Sheet URL for Finance data.");
  }

  const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
  const res = await fetch(gvizUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google Sheet Finance data (Status ${res.status})`);
  }

  const text = await res.text();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Invalid JSON format received from Google Sheet.");
  }

  const jsonStr = text.substring(firstBrace, lastBrace + 1);
  const data = JSON.parse(jsonStr);

  if (!data?.table?.rows) return [];

  const rows: GoogleSheetFinanceRow[] = [];
  let activeMonth = "2019-2025";

  for (let i = 0; i < data.table.rows.length; i++) {
    const cells = data.table.rows[i].c;
    const getVal = (idx: number) => {
      if (!cells || !cells[idx]) return null;
      return cells[idx].v !== undefined ? cells[idx].v : cells[idx].f;
    };

    const name = String(getVal(0) || "").trim();
    if (
      !name ||
      name.toLowerCase() === "total" ||
      (name.toLowerCase().includes("total") && name.toLowerCase().includes("loss"))
    ) {
      continue;
    }

    const incomeVal = getVal(1);
    const expenseVal = getVal(2);
    const income =
      typeof incomeVal === "number" ? incomeVal : parseFloat(String(incomeVal || 0)) || 0;
    const expense =
      typeof expenseVal === "number" ? expenseVal : parseFloat(String(expenseVal || 0)) || 0;

    const comments = String(getVal(4) || "").trim();
    const customer = String(getVal(5) || "").trim();
    const rowMonth = String(getVal(6) || "").trim();

    if (rowMonth) {
      activeMonth = rowMonth;
    }

    rows.push({
      name,
      income,
      expense,
      comments,
      customer,
      month: activeMonth,
    });
  }

  return rows;
}

/**
 * Synchronizes financial transactions and feed/medicine expenses from Google Sheet to database.
 */
export async function syncFinanceSheetToDatabase(
  customSheetUrl?: string
): Promise<GoogleSheetsFinanceSyncResult> {
  const sheetUrl = customSheetUrl || DEFAULT_FINANCE_SHEET_URL;
  const spreadsheetId = extractSpreadsheetId(sheetUrl) || "";
  const timestamp = new Date().toISOString();
  const errors: string[] = [];

  if (!spreadsheetId) {
    return {
      success: false,
      message: "Invalid Finance Google Sheet URL provided.",
      timestamp,
      sheetUrl,
      spreadsheetId: "",
      totalRows: 0,
      addedCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      totalIncome: 0,
      totalExpense: 0,
      netProfitLoss: 0,
      errors: ["Could not extract spreadsheet ID"],
    };
  }

  try {
    const rows = await fetchGoogleSheetFinanceData(sheetUrl);
    if (rows.length === 0) {
      return {
        success: false,
        message: "No financial transaction rows found in Google Sheet.",
        timestamp,
        sheetUrl,
        spreadsheetId,
        totalRows: 0,
        addedCount: 0,
        updatedCount: 0,
        unchangedCount: 0,
        totalIncome: 0,
        totalExpense: 0,
        netProfitLoss: 0,
        errors: ["Sheet returned 0 transaction rows"],
      };
    }

    const monthsMap: Record<string, string> = {
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      septmber: "09",
      september: "09",
    };

    let totalIncome = 0;
    let totalExpense = 0;
    let addedCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;

    const db = await connectDB();
    let existingTxns: ITransaction[] = [];
    if (db) {
      existingTxns = (await TransactionModel.find({}).lean()) as unknown as ITransaction[];
    } else {
      existingTxns = fallbackStore.get().transactions as unknown as ITransaction[];
    }

    // Filter out old demo dummy transactions (e.g. txn_2026_09_004, txn_historical_001, tx-001)
    // Retain only manual transactions created by user in app (timestamp IDs)
    const nonSheetTxns = existingTxns.filter(
      (t) =>
        t.id &&
        !t.id.startsWith("txn_sheet_") &&
        !t.id.startsWith("txn_2026_") &&
        !t.id.startsWith("txn_historical_") &&
        !t.id.startsWith("tx-")
    );

    const sheetTxns: ITransaction[] = [];
    const monthDayCounters: Record<string, number> = {};

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mLower = (row.month || "").toLowerCase();
      let date = "2026-05-15";
      if (mLower.includes("2019") || mLower.includes("2025")) {
        date = "2025-12-31";
      } else {
        for (const [mName, mNum] of Object.entries(monthsMap)) {
          if (mLower.startsWith(mName)) {
            if (!monthDayCounters[mNum]) monthDayCounters[mNum] = 1;
            const day = Math.min(28, 2 + (monthDayCounters[mNum] - 1) * 3);
            date = `2026-${mNum}-${String(day).padStart(2, "0")}`;
            monthDayCounters[mNum]++;
            break;
          }
        }
      }

      const type: "INCOME" | "EXPENSE" =
        row.income > 0 ||
        row.comments?.toUpperCase() === "SELL" ||
        row.comments?.toUpperCase() === "EXCHANGE"
          ? "INCOME"
          : "EXPENSE";

      const amount = type === "INCOME" ? row.income : row.expense;

      let category = "General Operations";
      if (type === "INCOME") {
        if (row.name.toLowerCase().includes("khorgus")) category = "Livestock Sale";
        else if (row.comments?.toLowerCase() === "exchange") category = "Pigeon Sale / Exchange";
        else category = "Pigeon Sale";
      } else {
        if (row.name.toLowerCase().includes("2019-2025")) category = "Initial Loft Investment / Historical Cost";
        else if (row.name.toLowerCase().includes("medicine")) category = "Medicine";
        else if (
          row.name.toLowerCase().includes("feed") ||
          row.name.toLowerCase().includes("seeds") ||
          row.name.toLowerCase().includes("gom") ||
          row.name.toLowerCase().includes("vusi")
        ) {
          category = "Feed";
        } else {
          category = "Farm Operations";
        }
      }

      const stableId = `txn_sheet_${i + 1}`;
      const customer = row.customer || (type === "INCOME" ? "Walk-in Buyer" : "Local Supplier");
      const notes = row.comments
        ? `Sheet: ${row.comments} | Month: ${row.month}`
        : `Month: ${row.month}`;

      const txnDoc: ITransaction = {
        _id: stableId,
        id: stableId,
        type,
        category,
        amount,
        date,
        description: row.name,
        customer,
        notes,
        createdAt: timestamp,
      };

      sheetTxns.push(txnDoc);
      if (type === "INCOME") totalIncome += amount;
      else totalExpense += amount;
      addedCount++;
    }

    const finalTxnsList = [...nonSheetTxns, ...sheetTxns];

    // Persist to data/transactions.json on disk for permanence across restarts
    try {
      const fs = await import("fs");
      const path = await import("path");
      const txnsFilePath = path.join(process.cwd(), "data", "transactions.json");
      fs.writeFileSync(
        txnsFilePath,
        JSON.stringify(finalTxnsList, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.warn("Could not persist transactions to disk:", e);
    }

    // Update fallback store memory
    const storeSettings = (fallbackStore.get().settings as Record<string, unknown>) || {};
    fallbackStore.set({
      transactions: finalTxnsList as unknown as Record<string, unknown>[],
      settings: {
        ...storeSettings,
        financeSheetUrl: sheetUrl,
        lastFinanceSyncedAt: timestamp,
      },
    });

    if (db) {
      // Clean up legacy demo records from MongoDB if any
      await TransactionModel.deleteMany({
        $or: [
          { _id: { $regex: "^txn_2026_" } },
          { _id: { $regex: "^tx-" } },
        ],
      });
      for (const txn of sheetTxns) {
        await TransactionModel.findByIdAndUpdate(txn._id, txn, { upsert: true });
      }
    }

    const netProfitLoss = totalIncome - totalExpense;

    return {
      success: true,
      message: `Successfully synchronized ${rows.length} transactions from Google Sheets (Income: ৳${totalIncome.toLocaleString()}, Expense: ৳${totalExpense.toLocaleString()}).`,
      timestamp,
      sheetUrl,
      spreadsheetId,
      totalRows: rows.length,
      addedCount,
      updatedCount,
      unchangedCount,
      totalIncome,
      totalExpense,
      netProfitLoss,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Finance sync failed";
    return {
      success: false,
      message: errorMsg,
      timestamp,
      sheetUrl,
      spreadsheetId,
      totalRows: 0,
      addedCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      totalIncome: 0,
      totalExpense: 0,
      netProfitLoss: 0,
      errors: [errorMsg],
    };
  }
}

/**
 * Synchronizes BOTH Google Sheets (Pigeon Registry + Finance Accounts).
 */
export async function syncAllGoogleSheets(
  pigeonsUrl?: string,
  financeUrl?: string
): Promise<DualSheetSyncResult> {
  const pigeonsSheet = pigeonsUrl || DEFAULT_PIGEONS_SHEET_URL;
  const financeSheet = financeUrl || DEFAULT_FINANCE_SHEET_URL;

  const [pigeonsResult, financeResult] = await Promise.all([
    syncGoogleSheetToDatabase(pigeonsSheet),
    syncFinanceSheetToDatabase(financeSheet),
  ]);

  const timestamp = new Date().toISOString();
  const success = pigeonsResult.success && financeResult.success;
  const message = `Synchronized ${pigeonsResult.totalRows} pigeons and ${financeResult.totalRows} transactions from 2 Google Sheets.`;

  // Update fallback store settings metadata
  const storeSettings = (fallbackStore.get().settings as Record<string, unknown>) || {};
  fallbackStore.set({
    settings: {
      ...storeSettings,
      pigeonsSheetUrl: pigeonsSheet,
      financeSheetUrl: financeSheet,
      lastSyncedAt: timestamp,
      lastSyncStatus: success ? "SUCCESS" : "ERROR",
      lastSyncMessage: message,
    },
  });

  return {
    success,
    message,
    timestamp,
    pigeons: pigeonsResult,
    finance: financeResult,
  };
}

