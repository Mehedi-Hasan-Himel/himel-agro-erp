import { NextRequest, NextResponse } from "next/server";
import {
  pushPigeonToGoogleSheet,
  testGoogleSheetWebhook,
  getGoogleSheetWebhookUrl,
} from "@/lib/services/googleSheetsPush";

export async function GET() {
  try {
    const webhookUrl = await getGoogleSheetWebhookUrl();
    return NextResponse.json({
      webhookUrl: webhookUrl || "",
      isConfigured: !!webhookUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl, pigeon, testOnly } = body;

    if (testOnly) {
      const urlToTest = webhookUrl || (await getGoogleSheetWebhookUrl());
      if (!urlToTest) {
        return NextResponse.json(
          { success: false, message: "No Webhook URL provided or configured." },
          { status: 400 }
        );
      }
      const testResult = await testGoogleSheetWebhook(urlToTest);
      return NextResponse.json(testResult);
    }

    if (body.pushAll) {
      const targetUrl = webhookUrl || (await getGoogleSheetWebhookUrl());
      if (!targetUrl) {
        return NextResponse.json(
          { success: false, message: "No Webhook URL provided or configured in Settings." },
          { status: 400 }
        );
      }

      const { connectDB } = await import("@/lib/mongodb");
      const { default: PigeonModel } = await import("@/models/Pigeon");
      const { fallbackStore } = await import("@/lib/fallbackStore");

      let allPigeons: any[] = [];
      const db = await connectDB();
      if (db) {
        allPigeons = await PigeonModel.find({}).sort({ ringSerial: 1 }).lean();
      } else {
        allPigeons = (fallbackStore.get().pigeons as any[]) || [];
      }

      const results = [];
      for (const p of allPigeons) {
        const res = await pushPigeonToGoogleSheet(p, targetUrl);
        results.push(res);
      }

      const successCount = results.filter((r) => r.success).length;
      return NextResponse.json({
        success: true,
        message: `Successfully pushed ${successCount} of ${allPigeons.length} pigeons to Google Sheet.`,
        pushedCount: successCount,
        total: allPigeons.length,
        results,
      });
    }

    if (!pigeon) {
      return NextResponse.json(
        { error: "Pigeon data required for push." },
        { status: 400 }
      );
    }

    const result = await pushPigeonToGoogleSheet(pigeon, webhookUrl);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to push";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
