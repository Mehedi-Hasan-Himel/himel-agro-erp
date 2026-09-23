import { Pigeon } from "@/types/pigeon";
import { GoogleSheetPushResult } from "@/types/googleSheets";
import { connectDB } from "@/lib/mongodb";
import AppConfigModel from "@/models/AppConfig";
import { fallbackStore } from "@/lib/fallbackStore";

/**
 * Retrieves the configured Google Sheet Webhook URL.
 * Checks environment variable, MongoDB settings, and fallback store.
 */
export async function getGoogleSheetWebhookUrl(): Promise<string | null> {
  // 1. Environment variable priority
  if (process.env.GOOGLE_SHEETS_PIGEON_WEBHOOK_URL) {
    return process.env.GOOGLE_SHEETS_PIGEON_WEBHOOK_URL.trim();
  }

  try {
    const isConnected = await connectDB();
    if (isConnected) {
      // Check SETTINGS doc
      const settingsDoc = await AppConfigModel.findById("SETTINGS").lean();
      const settingsData = (settingsDoc?.data as Record<string, unknown>) || {};
      if (settingsData.googleSheetsWebhookUrl && typeof settingsData.googleSheetsWebhookUrl === "string") {
        return settingsData.googleSheetsWebhookUrl.trim();
      }

      // Check GOOGLE_SHEETS_CONFIG doc
      const sheetsConfig = await AppConfigModel.findById("GOOGLE_SHEETS_CONFIG").lean();
      const configData = (sheetsConfig?.data as Record<string, unknown>) || {};
      if (configData.pigeonsWebhookUrl && typeof configData.pigeonsWebhookUrl === "string") {
        return configData.pigeonsWebhookUrl.trim();
      }
    }
  } catch (err) {
    console.warn("Could not read webhook from MongoDB:", err);
  }

  // 2. Check fallback memory store
  const storeSettings = (fallbackStore.get().settings as Record<string, unknown>) || {};
  if (storeSettings.googleSheetsWebhookUrl && typeof storeSettings.googleSheetsWebhookUrl === "string") {
    return storeSettings.googleSheetsWebhookUrl.trim();
  }

  return null;
}

/**
 * Pushes a newly registered or updated pigeon to the Google Sheet via Apps Script Webhook.
 */
export async function pushPigeonToGoogleSheet(
  pigeon: Partial<Pigeon>,
  overrideWebhookUrl?: string
): Promise<GoogleSheetPushResult> {
  const now = new Date().toISOString();
  const ringYear = pigeon.ringYear || 2026;
  const ringSerial = pigeon.ringSerial || 1;
  const officialRingNumber =
    pigeon.officialRingNumber ||
    `${String(ringSerial).padStart(2, "0")}--${ringYear}`;

  const webhookUrl = overrideWebhookUrl || (await getGoogleSheetWebhookUrl());

  if (!webhookUrl) {
    return {
      success: false,
      message: "No Google Sheet Webhook URL configured in Settings.",
      timestamp: now,
      ringNumber: officialRingNumber,
      action: "SKIPPED",
    };
  }

  // Prepare standard payload mapping to Google Sheet columns
  const payload = {
    action: "INSERT_PIGEON",
    ringNumber: officialRingNumber,
    officialRingNumber,
    ringSerial,
    ringYear,
    category: pigeon.breedSubtype || "",
    breedSubtype: pigeon.breedSubtype || "",
    breed: pigeon.breed || "Giribaz",
    hatchDate: pigeon.hatchDate || pigeon.birthDate || "",
    colorPattern: pigeon.colorPattern || "",
    gender:
      pigeon.sex === "FEMALE"
        ? "Hen / Female"
        : pigeon.sex === "MALE"
        ? "Cock / Male"
        : "Young / NA",
    sex: pigeon.sex || "UNKNOWN",
    status:
      pigeon.status === "ACTIVE"
        ? "Kept"
        : pigeon.status === "LOST"
        ? "Lost"
        : pigeon.status === "SOLD"
        ? "Sold"
        : pigeon.status === "DEAD"
        ? "Dead"
        : pigeon.status || "Kept",
    notes: pigeon.notes || "",
    father: pigeon.fatherDetails || "",
    fatherDetails: pigeon.fatherDetails || "",
    mother: pigeon.motherDetails || "",
    motherDetails: pigeon.motherDetails || "",
    potentialGrade: pigeon.potentialGrade || "",
    timestamp: now,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        message: `Google Sheet webhook returned status ${res.status}: ${res.statusText}`,
        timestamp: now,
        ringNumber: officialRingNumber,
        error: `HTTP ${res.status}`,
      };
    }

    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Some Apps Script webhooks return plain text or HTML redirect
      parsed = { result: text };
    }

    return {
      success: true,
      message:
        parsed?.message ||
        `Successfully synced pigeon ${officialRingNumber} into Google Sheet.`,
      timestamp: now,
      ringNumber: officialRingNumber,
      action: parsed?.action || "INSERT",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("pushPigeonToGoogleSheet error:", errorMsg);
    return {
      success: false,
      message: `Failed to push pigeon to Google Sheet: ${errorMsg}`,
      timestamp: now,
      ringNumber: officialRingNumber,
      error: errorMsg,
    };
  }
}

/**
 * Tests connection to a Google Sheet Webhook URL.
 */
export async function testGoogleSheetWebhook(
  webhookUrl: string
): Promise<{ success: boolean; message: string; status?: number }> {
  if (!webhookUrl || typeof webhookUrl !== "string") {
    return { success: false, message: "Please enter a valid webhook URL." };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const testPayload = {
      action: "PING_TEST",
      message: "Connection test from Himel Agro ERP",
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return {
        success: true,
        message: "Connection successful! Webhook answered with HTTP " + res.status,
        status: res.status,
      };
    }

    return {
      success: false,
      message: `Webhook returned status ${res.status}: ${res.statusText}`,
      status: res.status,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Connection test failed: ${errorMsg}`,
    };
  }
}

/**
 * Deletes a pigeon row from Google Sheet via Apps Script Webhook.
 */
export async function deletePigeonFromGoogleSheet(
  ringNumber: string,
  overrideWebhookUrl?: string
): Promise<GoogleSheetPushResult> {
  const now = new Date().toISOString();
  const webhookUrl = overrideWebhookUrl || (await getGoogleSheetWebhookUrl());

  if (!webhookUrl) {
    return {
      success: false,
      message: "No Google Sheet Webhook URL configured in Settings.",
      timestamp: now,
      ringNumber,
      action: "SKIPPED",
    };
  }

  const payload = {
    action: "DELETE_PIGEON",
    officialRingNumber: ringNumber,
    ringNumber,
    timestamp: now,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        message: `Google Sheet webhook returned status ${res.status}: ${res.statusText}`,
        timestamp: now,
        ringNumber,
        error: `HTTP ${res.status}`,
      };
    }

    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { result: text };
    }

    return {
      success: true,
      message: parsed?.message || `Deleted ring ${ringNumber} from Google Sheet.`,
      timestamp: now,
      ringNumber,
      action: "DELETE",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("deletePigeonFromGoogleSheet error:", errorMsg);
    return {
      success: false,
      message: `Failed to delete pigeon from Google Sheet: ${errorMsg}`,
      timestamp: now,
      ringNumber,
      error: errorMsg,
    };
  }
}

/**
 * Bulk deletes pigeon rows from Google Sheet via Apps Script Webhook.
 */
export async function bulkDeletePigeonsFromGoogleSheet(
  ringNumbers: string[],
  overrideWebhookUrl?: string
): Promise<{ success: boolean; deletedCount: number; message: string }> {
  const webhookUrl = overrideWebhookUrl || (await getGoogleSheetWebhookUrl());
  if (!webhookUrl || ringNumbers.length === 0) {
    return { success: false, deletedCount: 0, message: "Skipped: No webhook or empty ring numbers" };
  }

  const payload = {
    action: "DELETE_PIGEONS",
    officialRingNumbers: ringNumbers,
    ringNumbers,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { success: false, deletedCount: 0, message: `Webhook error ${res.status}` };
    }

    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    return {
      success: true,
      deletedCount: parsed?.deletedCount ?? ringNumbers.length,
      message: parsed?.message || `Deleted ${ringNumbers.length} rows from Google Sheet.`,
    };
  } catch (err) {
    return {
      success: false,
      deletedCount: 0,
      message: err instanceof Error ? err.message : "Failed to bulk delete",
    };
  }
}
