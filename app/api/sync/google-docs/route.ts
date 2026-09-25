import { NextRequest, NextResponse } from "next/server";
import {
  fetchGoogleDocRawText,
  parseGoogleDocMedicineGuidelines,
  syncGoogleDocToDatabase,
} from "@/lib/services/googleDocSync";
import { DEFAULT_MEDICINE_GUIDE_DOC_URL } from "@/types/googleSheets";
import { connectDB } from "@/lib/mongodb";
import AppConfigModel from "@/models/AppConfig";
import { fallbackStore } from "@/lib/fallbackStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/sync/google-docs
 * Fetches the real-time content from the Google Doc without caching.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let docUrl = searchParams.get("docUrl");

    if (!docUrl) {
      // Check stored config
      try {
        const db = await connectDB();
        if (db) {
          const configDoc = await AppConfigModel.findById("GOOGLE_DOC_CONFIG").lean();
          if (configDoc?.data && (configDoc.data as any).medicineDocUrl) {
            docUrl = (configDoc.data as any).medicineDocUrl;
          }
        }
      } catch (err) {
        console.warn("Could not read GOOGLE_DOC_CONFIG:", err);
      }

      if (!docUrl) {
        const storeSettings = (fallbackStore.get().settings as Record<string, unknown>) || {};
        docUrl = (storeSettings.medicineDocUrl as string) || DEFAULT_MEDICINE_GUIDE_DOC_URL;
      }
    }

    const { text, docId } = await fetchGoogleDocRawText(docUrl);
    const guidelines = parseGoogleDocMedicineGuidelines(text, docUrl);

    return NextResponse.json({
      success: true,
      documentUrl: docUrl,
      documentId: docId,
      lastFetchedAt: new Date().toISOString(),
      guidelines,
    });
  } catch (error) {
    console.error("GET /api/sync/google-docs error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch Google Doc guidelines",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync/google-docs
 * Synchronizes the Google Doc's guidelines directly into the ERP's medicine schedule database.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { docUrl, targetYear } = body;

    const result = await syncGoogleDocToDatabase(docUrl, targetYear);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("POST /api/sync/google-docs error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync Google Doc to database",
      },
      { status: 500 }
    );
  }
}
