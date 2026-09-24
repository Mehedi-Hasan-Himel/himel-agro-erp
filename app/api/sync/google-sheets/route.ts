import { NextRequest, NextResponse } from "next/server";
import {
  syncGoogleSheetToDatabase,
  syncFinanceSheetToDatabase,
  syncAllGoogleSheets,
  fetchGoogleSheetData,
  fetchGoogleSheetFinanceData,
  DEFAULT_PIGEONS_SHEET_URL,
  DEFAULT_FINANCE_SHEET_URL,
  DEFAULT_MEDICINE_GUIDE_DOC_URL,
  extractSpreadsheetId,
} from "@/lib/services/googleSheetsSync";
import { connectDB } from "@/lib/mongodb";
import AppConfigModel from "@/models/AppConfig";
import { fallbackStore } from "@/lib/fallbackStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get("preview") === "true";
    const type = searchParams.get("type"); // "pigeons" | "finance" | null

    let pigeonsUrl = searchParams.get("pigeonsUrl") || DEFAULT_PIGEONS_SHEET_URL;
    let financeUrl = searchParams.get("financeUrl") || DEFAULT_FINANCE_SHEET_URL;
    let medicineDocUrl = searchParams.get("medicineDocUrl") || DEFAULT_MEDICINE_GUIDE_DOC_URL;
    let syncMeta: Record<string, unknown> = {};

    const db = await connectDB();
    if (db) {
      const configDoc = await AppConfigModel.findById("GOOGLE_SHEETS_CONFIG").lean();
      if (configDoc?.data) {
        syncMeta = configDoc.data as Record<string, unknown>;
        if (syncMeta.pigeonsSheetUrl) pigeonsUrl = String(syncMeta.pigeonsSheetUrl);
        if (syncMeta.financeSheetUrl) financeUrl = String(syncMeta.financeSheetUrl);
        if (syncMeta.medicineDocUrl) medicineDocUrl = String(syncMeta.medicineDocUrl);
      }
    } else {
      const storeSettings = (fallbackStore.get().settings as Record<string, unknown>) || {};
      if (storeSettings.pigeonsSheetUrl) pigeonsUrl = String(storeSettings.pigeonsSheetUrl);
      if (storeSettings.financeSheetUrl) financeUrl = String(storeSettings.financeSheetUrl);
      if (storeSettings.medicineDocUrl) medicineDocUrl = String(storeSettings.medicineDocUrl);
      syncMeta = storeSettings;
    }

    let previewData = null;
    if (preview) {
      if (type === "finance") {
        previewData = await fetchGoogleSheetFinanceData(financeUrl);
      } else {
        previewData = await fetchGoogleSheetData(pigeonsUrl);
      }
    }

    return NextResponse.json({
      pigeonsSheetUrl: pigeonsUrl,
      financeSheetUrl: financeUrl,
      medicineDocUrl,
      defaultPigeonsSheetUrl: DEFAULT_PIGEONS_SHEET_URL,
      defaultFinanceSheetUrl: DEFAULT_FINANCE_SHEET_URL,
      defaultMedicineDocUrl: DEFAULT_MEDICINE_GUIDE_DOC_URL,
      lastSyncedAt: syncMeta.lastSyncedAt || null,
      lastSyncStatus: syncMeta.lastSyncStatus || null,
      lastSyncMessage: syncMeta.lastSyncMessage || null,
      previewData,
    });
  } catch (error) {
    console.error("GET /api/sync/google-sheets error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get sync status",
        pigeonsSheetUrl: DEFAULT_PIGEONS_SHEET_URL,
        financeSheetUrl: DEFAULT_FINANCE_SHEET_URL,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sheetUrl, type, pigeonsSheetUrl, financeSheetUrl } = body;

    // 1. If explicitly requested pigeons sync
    if (type === "PIGEONS" || (sheetUrl && sheetUrl.includes(extractSpreadsheetId(DEFAULT_PIGEONS_SHEET_URL) || ""))) {
      const result = await syncGoogleSheetToDatabase(sheetUrl || pigeonsSheetUrl || DEFAULT_PIGEONS_SHEET_URL);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // 2. If explicitly requested finance sync
    if (type === "FINANCE" || (sheetUrl && sheetUrl.includes(extractSpreadsheetId(DEFAULT_FINANCE_SHEET_URL) || ""))) {
      const result = await syncFinanceSheetToDatabase(sheetUrl || financeSheetUrl || DEFAULT_FINANCE_SHEET_URL);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // 3. If a single custom sheetUrl is provided, detect type or sync accordingly
    if (sheetUrl) {
      // Try to determine if it's finance or pigeons
      try {
        const financeRows = await fetchGoogleSheetFinanceData(sheetUrl);
        if (financeRows.length > 0 && financeRows.some((r) => r.income > 0 || r.expense > 0)) {
          const result = await syncFinanceSheetToDatabase(sheetUrl);
          return NextResponse.json(result, { status: result.success ? 200 : 400 });
        }
      } catch {
        // Fall back to pigeon sync
      }
      const result = await syncGoogleSheetToDatabase(sheetUrl);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // 4. Default / Sync Both: Sync both Pigeons Registry and Finance sheets
    const dualResult = await syncAllGoogleSheets(
      pigeonsSheetUrl || DEFAULT_PIGEONS_SHEET_URL,
      financeSheetUrl || DEFAULT_FINANCE_SHEET_URL
    );

    return NextResponse.json(dualResult, {
      status: dualResult.success ? 200 : 400,
    });
  } catch (error) {
    console.error("POST /api/sync/google-sheets error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Synchronization failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
