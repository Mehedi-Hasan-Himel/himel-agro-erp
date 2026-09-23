"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FarmSettings } from "@/types/settings";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import { BreedConfig } from "@/types/breed";
import {
  getSettings,
  updateSettings,
  getBreeds,
  addBreedSubtype,
} from "@/lib/repositories/settingsRepository";
import {
  resetToSeedData,
  exportAllData,
  importAllData,
  notifyDataChanged,
} from "@/lib/repositories/storageAdapter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Settings,
  Feather,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  MapPin,
  ExternalLink,
  Globe,
  FileSpreadsheet,
  Copy,
  Check,
  DollarSign,
  Send,
  Zap,
  Save,
} from "lucide-react";
import {
  DEFAULT_PIGEONS_SHEET_URL,
  DEFAULT_FINANCE_SHEET_URL,
  DualSheetSyncResult,
} from "@/types/googleSheets";

const GOOGLE_APPS_SCRIPT_INSERT_CODE = `function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Flock") || ss.getActiveSheet();
    var payload = JSON.parse(e.postData.contents);

    // 1. Connection Ping Test
    if (payload.action === "PING_TEST") {
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Himel Agro ERP Webhook Connected!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Delete Single Pigeon Row
    if (payload.action === "DELETE_PIGEON" || payload.action === "DELETE") {
      var targetRing = String(payload.officialRingNumber || payload.ringNumber || "").trim().toLowerCase();
      var data = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][0] && String(data[i][0]).trim().toLowerCase() === targetRing) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ success: true, action: "DELETE", message: "Deleted ring " + targetRing }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, action: "DELETE", message: "Ring not found or already deleted" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Delete Multiple Pigeons (Bulk)
    if (payload.action === "DELETE_PIGEONS" || payload.action === "BULK_DELETE") {
      var targetRings = (payload.officialRingNumbers || payload.ringNumbers || []).map(function(r) {
        return String(r).trim().toLowerCase();
      });
      var data = sheet.getDataRange().getValues();
      var deletedCount = 0;
      for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][0] && targetRings.indexOf(String(data[i][0]).trim().toLowerCase()) !== -1) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, action: "BULK_DELETE", deletedCount: deletedCount }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Create or Update Pigeon Row
    var ringNumber = payload.officialRingNumber || payload.ringNumber || "";
    var data = sheet.getDataRange().getValues();
    var foundRow = -1;

    // Check if ring already exists (Col A)
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && String(data[i][0]).trim().toLowerCase() === String(ringNumber).trim().toLowerCase()) {
        foundRow = i + 1;
        break;
      }
    }

    var rowValues = [
      ringNumber,
      payload.category || payload.breedSubtype || "",
      payload.breed || "Giribaz",
      payload.hatchDate || "",
      payload.colorPattern || "",
      payload.gender || payload.sex || "Young / NA",
      payload.status || "Kept",
      payload.notes || "",
      payload.fatherDetails || payload.father || "",
      payload.motherDetails || payload.mother || ""
    ];

    if (foundRow > 0) {
      sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, action: "UPDATE", message: "Updated ring " + ringNumber }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      sheet.appendRow(rowValues);
      return ContentService.createTextOutput(JSON.stringify({ success: true, action: "INSERT", message: "Inserted ring " + ringNumber }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, status: "Active" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export default function SettingsPage() {
  const [settings, setSettings] = useState<FarmSettings | null>(null);
  const [breeds, setBreeds] = useState<BreedConfig | null>(null);
  const [newSubtype, setNewSubtype] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Giribaz");

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Dual Google Sheets Live Sync State
  const [pigeonsSheetUrl, setPigeonsSheetUrl] = useState(DEFAULT_PIGEONS_SHEET_URL);
  const [financeSheetUrl, setFinanceSheetUrl] = useState(DEFAULT_FINANCE_SHEET_URL);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [dualSyncResult, setDualSyncResult] = useState<DualSheetSyncResult | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // 2-Way Push to Google Sheets State
  const [googleSheetsWebhookUrl, setGoogleSheetsWebhookUrl] = useState("");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [saveWebhookSuccess, setSaveWebhookSuccess] = useState(false);
  const [isPushingAll, setIsPushingAll] = useState(false);
  const [pushAllResult, setPushAllResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [webhookTestResult, setWebhookTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [copiedInsertScript, setCopiedInsertScript] = useState(false);

  useEffect(() => {
    async function load() {
      const [s, b] = await Promise.all([getSettings(), getBreeds()]);
      setSettings(s);
      setBreeds(b);
      if (s?.googleSheetsUrl) {
        setPigeonsSheetUrl(s.googleSheetsUrl);
      }
      if (s?.googleSheetsWebhookUrl) {
        setGoogleSheetsWebhookUrl(s.googleSheetsWebhookUrl);
      }
    }
    load();
  }, []);

  const handleSyncAllSheets = async () => {
    setIsSyncingSheet(true);
    try {
      const res = await fetch("/api/sync/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pigeonsSheetUrl, financeSheetUrl }),
      });
      const data: DualSheetSyncResult = await res.json();
      setDualSyncResult(data);
      if (data.success) {
        notifyDataChanged();
        if (settings) {
          updateSettings({ ...settings, googleSheetsUrl: pigeonsSheetUrl });
        }
      }
    } catch (err) {
      console.error("Sheet sync failed:", err);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleSyncSpecificSheet = async (type: "PIGEONS" | "FINANCE") => {
    setIsSyncingSheet(true);
    try {
      const res = await fetch("/api/sync/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          sheetUrl: type === "PIGEONS" ? pigeonsSheetUrl : financeSheetUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notifyDataChanged();
        // Update partial dualSyncResult
        setDualSyncResult((prev) => ({
          success: true,
          message: data.message,
          timestamp: new Date().toISOString(),
          pigeons: type === "PIGEONS" ? data : prev?.pigeons || ({} as any),
          finance: type === "FINANCE" ? data : prev?.finance || ({} as any),
        }));
      }
    } catch (err) {
      console.error(`${type} sheet sync failed:`, err);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!googleSheetsWebhookUrl.trim()) return;
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const res = await fetch("/api/sync/google-sheets/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: googleSheetsWebhookUrl.trim(),
          testOnly: true,
        }),
      });
      const data = await res.json();
      setWebhookTestResult(data);
      if (data.success && settings) {
        const updated = {
          ...settings,
          googleSheetsWebhookUrl: googleSheetsWebhookUrl.trim(),
        };
        await updateSettings(updated);
        setSettings(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setWebhookTestResult({ success: false, message: msg });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSaveWebhook = async () => {
    if (!settings) return;
    setIsSavingWebhook(true);
    try {
      const updated = {
        ...settings,
        googleSheetsWebhookUrl: googleSheetsWebhookUrl.trim(),
      };
      await updateSettings(updated);
      setSettings(updated);
      setSaveWebhookSuccess(true);
      setTimeout(() => setSaveWebhookSuccess(false), 4000);
    } catch (err) {
      console.error("Save webhook failed:", err);
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handlePushAllToSheet = async () => {
    if (!googleSheetsWebhookUrl.trim()) return;
    setIsPushingAll(true);
    setPushAllResult(null);
    try {
      const res = await fetch("/api/sync/google-sheets/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: googleSheetsWebhookUrl.trim(),
          pushAll: true,
        }),
      });
      const data = await res.json();
      setPushAllResult({
        success: data.success,
        message: data.message || (data.success ? `Pushed ${data.pushedCount} pigeons to Google Sheet.` : data.error),
      });
    } catch (err) {
      setPushAllResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to push to Google Sheet",
      });
    } finally {
      setIsPushingAll(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingSettings(true);
    try {
      const updated = {
        ...settings,
        googleSheetsUrl: pigeonsSheetUrl,
        googleSheetsWebhookUrl: googleSheetsWebhookUrl.trim(),
      };
      await updateSettings(updated);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddSubtype = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtype.trim()) return;
    const updated = await addBreedSubtype(selectedCategory, newSubtype.trim());
    setBreeds({ ...updated });
    setNewSubtype("");
  };

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `himel-agro-erp-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export data from server.");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importAllData(content);
      if (success) {
        setImportStatus("Database imported successfully from MongoDB! Refreshing data...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus("Failed to import JSON data. Please verify file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = async () => {
    if (
      confirm(
        "Are you sure you want to reset all farm data in MongoDB back to the demo seed dataset (~40 pigeons, pairs, rounds, feed, transactions)?"
      )
    ) {
      try {
        await resetToSeedData();
        setResetSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error("Reset failed:", err);
        alert("Failed to reset data. Please try again.");
      }
    }
  };

  if (!settings || !breeds) {
    return (
      <div className="py-20 text-center text-slate-400">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Farm Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Loft identity, official branding, Facebook & map integration, and data backup tools.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Farm settings saved successfully!</span>
        </div>
      )}

      {/* Brand Identity & Media Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl text-white shadow-md border border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 w-full">
          {/* Radiant Green Light Glowing Logo Container */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-950/80 ring-4 ring-emerald-400 ring-offset-2 sm:ring-offset-4 ring-offset-emerald-950 shadow-xl sm:shadow-2xl shadow-emerald-400/50 flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src={SITE_CONFIG.logoUrl}
              alt={settings.farmName || SITE_CONFIG.farmName}
              width={240}
              height={240}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Official Farm Branding
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
              {settings.farmName || SITE_CONFIG.farmName}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{settings.location || SITE_CONFIG.location}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-col lg:flex-row items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t border-emerald-800/50 md:border-t-0">
          <a
            href={settings.whatsappNumber ? `https://wa.me/88${settings.whatsappNumber}` : SITE_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all text-center"
          >
            <span className="font-black text-sm">WA</span>
            <span className="truncate">WhatsApp ({settings.whatsappNumber || SITE_CONFIG.whatsappNumber})</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
          </a>
          {(settings.facebookUrl || SITE_CONFIG.facebookUrl) && (
            <a
              href={settings.facebookUrl || SITE_CONFIG.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all text-center"
            >
              <span className="font-black text-sm">f</span>
              <span>Facebook Page</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
            </a>
          )}
          {(settings.googleMapUrl || SITE_CONFIG.googleMapUrl) && (
            <a
              href={settings.googleMapUrl || SITE_CONFIG.googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all text-center"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
            </a>
          )}
        </div>
      </div>

      {/* 1. Farm Identity Settings */}
      <Card>
        <CardHeader>
          <CardTitle>1. Farm Profile & Social Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Farm / Brand Name"
                value={settings.farmName}
                onChange={(e) =>
                  setSettings({ ...settings, farmName: e.target.value })
                }
                required
              />
              <Input
                label="Official Contact Number"
                value={settings.contactNumber}
                onChange={(e) =>
                  setSettings({ ...settings, contactNumber: e.target.value })
                }
                required
                helperText="Primary contact number"
              />
              <Input
                label="WhatsApp Number"
                value={settings.whatsappNumber || ""}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappNumber: e.target.value })
                }
                placeholder="01560059954"
                helperText="For direct WhatsApp chat integration"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Facebook Page URL"
                value={settings.facebookUrl || ""}
                onChange={(e) =>
                  setSettings({ ...settings, facebookUrl: e.target.value })
                }
                placeholder="https://www.facebook.com/Himel.Pet.House"
                helperText="Direct link to your farm Facebook page"
              />
              <Input
                label="Google Maps Location URL"
                value={settings.googleMapUrl || ""}
                onChange={(e) =>
                  setSettings({ ...settings, googleMapUrl: e.target.value })
                }
                placeholder="https://maps.app.goo.gl/..."
                helperText="Map link for customers & visitors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Farm Owner Name"
                value={settings.ownerName}
                onChange={(e) =>
                  setSettings({ ...settings, ownerName: e.target.value })
                }
                required
              />
              <Input
                label="Currency Code"
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                required
              />
              <Input
                label="Currency Symbol"
                value={settings.currencySymbol}
                onChange={(e) =>
                  setSettings({ ...settings, currencySymbol: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Established Year"
                type="number"
                value={settings.establishedYear}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    establishedYear: parseInt(e.target.value, 10) || 2024,
                  })
                }
                required
              />
              <Input
                label="Location / Region"
                value={settings.location}
                onChange={(e) =>
                  setSettings({ ...settings, location: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSavingSettings}
                size="sm"
              >
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Google Sheets Live Integration & Automatic Sync */}
      <Card className="border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20 shadow-xs">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <CardTitle>2. Google Sheets Live Integration (Dual Sheets)</CardTitle>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              2 Live Sheets Connected
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Synchronize your <strong>Pigeon Flock Registry</strong> and <strong>Farm Finances & Accounts</strong> directly
            from your 2 live Google Spreadsheets. Whenever you make edits in either spreadsheet, the app will update
            automatically in the background or immediately when clicking <strong>Sync Both Sheets Now</strong>.
          </p>

          {/* Sync Result Banner */}
          {dualSyncResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex flex-col gap-2 ${
                dualSyncResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-2">
                {dualSyncResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <p className="font-bold text-sm">{dualSyncResult.message}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                {dualSyncResult.pigeons && (
                  <div className="p-2 bg-white/70 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-800">🕊️ Pigeons Registry:</span>{" "}
                    {dualSyncResult.pigeons.totalRows} rows ({dualSyncResult.pigeons.addedCount} added, {dualSyncResult.pigeons.updatedCount} updated, {dualSyncResult.pigeons.unchangedCount} unchanged)
                  </div>
                )}
                {dualSyncResult.finance && (
                  <div className="p-2 bg-white/70 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-800">💰 Financial Ledger:</span>{" "}
                    {dualSyncResult.finance.totalRows} transactions (Income: ৳{(dualSyncResult.finance.totalIncome || 0).toLocaleString()}, Expense: ৳{(dualSyncResult.finance.totalExpense || 0).toLocaleString()})
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sheet 1: Pigeon Flock Registry */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>🕊️</span> 1. Pigeon Flock Registry Sheet
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Ring & Flock Master</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="Pigeon Flock Spreadsheet URL"
                  value={pigeonsSheetUrl}
                  onChange={(e) => setPigeonsSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pb-0.5">
                <a
                  href={pigeonsSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all flex-1 sm:flex-initial"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open</span>
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => handleSyncSpecificSheet("PIGEONS")}
                  isLoading={isSyncingSheet}
                  className="gap-1.5 flex-1 sm:flex-initial text-xs"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingSheet ? "animate-spin" : ""}`} />
                  <span>Sync Pigeons</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Sheet 2: Farm Finances & Accounts */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>💰</span> 2. Farm Finances & Accounts Sheet
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Income, Expense & Feed</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="Finance & Accounts Spreadsheet URL"
                  value={financeSheetUrl}
                  onChange={(e) => setFinanceSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pb-0.5">
                <a
                  href={financeSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all flex-1 sm:flex-initial"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open</span>
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => handleSyncSpecificSheet("FINANCE")}
                  isLoading={isSyncingSheet}
                  className="gap-1.5 flex-1 sm:flex-initial text-xs text-emerald-800 border-emerald-200"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingSheet ? "animate-spin" : ""}`} />
                  <span>Sync Finance</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 3. Automatic 2-Way Sync: Insert Registered Pigeons into Google Sheet */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Automatic 2-Way Sync: Insert Registered Pigeons into Google Sheet</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ERP → Google Sheet
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When you click <strong>Register Pigeon</strong> in the ERP, the app automatically appends the new pigeon row directly into your Google Sheet. Paste your Google Apps Script Web App URL below:
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="Pigeon Insert Webhook URL (Apps Script Web App)"
                  value={googleSheetsWebhookUrl}
                  onChange={(e) => setGoogleSheetsWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 pb-0.5">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSaveWebhook}
                  disabled={!googleSheetsWebhookUrl.trim() || isSavingWebhook}
                  isLoading={isSavingWebhook}
                  className="gap-1.5 flex-1 sm:flex-initial text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveWebhookSuccess ? "Saved!" : "Save Webhook"}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleTestWebhook}
                  disabled={!googleSheetsWebhookUrl.trim() || isTestingWebhook}
                  isLoading={isTestingWebhook}
                  className="gap-1.5 flex-1 sm:flex-initial text-xs text-slate-800 border-slate-300"
                >
                  <Zap className={`w-3.5 h-3.5 ${isTestingWebhook ? "text-amber-500 animate-pulse" : "text-emerald-600"}`} />
                  <span>Test Connection</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handlePushAllToSheet}
                  disabled={!googleSheetsWebhookUrl.trim() || isPushingAll}
                  isLoading={isPushingAll}
                  className="gap-1.5 flex-1 sm:flex-initial text-xs text-slate-800 border-slate-300 hover:bg-emerald-50"
                  title="Push all registered pigeons in ERP (Rings 21, 22...) to Google Sheet"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Push All Pigeons to Sheet</span>
                </Button>
              </div>
            </div>

            {saveWebhookSuccess && (
              <div className="p-2.5 rounded-lg text-xs flex items-center gap-2 border bg-emerald-100/70 text-emerald-900 border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Google Sheet Webhook URL saved successfully! Live 2-way push is active.</span>
              </div>
            )}

            {webhookTestResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                  webhookTestResult.success
                    ? "bg-emerald-100/60 text-emerald-900 border-emerald-300"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {webhookTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{webhookTestResult.message}</span>
              </div>
            )}

            {pushAllResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                  pushAllResult.success
                    ? "bg-emerald-100/60 text-emerald-900 border-emerald-300"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {pushAllResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{pushAllResult.message}</span>
              </div>
            )}

            {/* Apps Script Guide */}
            <div className="pt-2 border-t border-emerald-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                  <span>📋</span> Google Apps Script Code (Copy & Deploy in 1 minute):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_INSERT_CODE);
                    setCopiedInsertScript(true);
                    setTimeout(() => setCopiedInsertScript(false), 3000);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold text-white transition-colors cursor-pointer"
                >
                  {copiedInsertScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedInsertScript ? "Copied!" : "Copy Insert Script"}</span>
                </button>
              </div>

              <ol className="text-[11px] text-slate-600 list-decimal list-inside space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                <li>In Google Sheet, open <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Paste the script, click <strong>Deploy &gt; New deployment &gt; Select type: Web app</strong>.</li>
                <li>Set <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>.</li>
                <li>Copy the <strong>Web App URL</strong>, paste it into the field above, and click <strong>Test Connection</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Master Sync Both Sheets Button */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500">
              Auto-sync runs automatically on app load, tab focus, and every 30 seconds.
            </p>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSyncAllSheets}
              isLoading={isSyncingSheet}
              className="w-full sm:w-auto gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? "animate-spin" : ""}`} />
              <span>Sync Both Sheets Now</span>
            </Button>
          </div>

          {/* Google Apps Script Webhook Guide for Instant Push */}
          <div className="p-4 bg-slate-900 rounded-xl text-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>⚡</span> Instant Push on Sheet Edit (Google Apps Script Webhook)
              </span>
              <button
                type="button"
                onClick={() => {
                  const code = `function onEdit(e) {\n  var erpUrl = "http://localhost:3000/api/sync/google-sheets";\n  var options = {\n    method: "post",\n    contentType: "application/json",\n    payload: JSON.stringify({ source: "google_sheets_trigger" }),\n    muteHttpExceptions: true\n  };\n  try {\n    UrlFetchApp.fetch(erpUrl, options);\n  } catch (err) {\n    Logger.log("Sync error: " + err);\n  }\n}`;
                  navigator.clipboard.writeText(code);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 3000);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-emerald-400 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedWebhook ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWebhook ? "Copied!" : "Copy Script"}</span>
              </button>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              To have the app update <strong>immediately</strong> whenever you edit a cell in either sheet: in your Google Sheet, open <strong>Extensions &gt; Apps Script</strong>, paste the script below, and save:
            </p>
            <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`function onEdit(e) {
  var erpUrl = "http://localhost:3000/api/sync/google-sheets";
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ source: "google_sheets_trigger" }),
    muteHttpExceptions: true
  };
  try {
    UrlFetchApp.fetch(erpUrl, options);
  } catch (err) {
    Logger.log("Sync error: " + err);
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* 3. Breed Categories & Subtypes */}
      <Card>
        <CardHeader>
          <CardTitle>3. Breed Lineages & Subtypes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {breeds.categories.map((cat) => (
              <div
                key={cat.name}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {cat.name} ({cat.subtypes.length} Subtypes)
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subtypes.map((sub) => (
                    <span
                      key={sub}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Subtype Form */}
          <form
            onSubmit={handleAddSubtype}
            className="pt-4 border-t border-slate-100 flex flex-wrap items-end gap-3"
          >
            <div className="w-48">
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
              >
                {breeds.categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Input
                label="New Subtype Name"
                placeholder="e.g. Red Bar Racer, Siraji..."
                value={newSubtype}
                onChange={(e) => setNewSubtype(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="secondary" size="md" className="gap-1">
              <Plus className="w-4 h-4" /> Add Subtype
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 3. Data Persistence & Backup Tools */}
      <Card>
        <CardHeader>
          <CardTitle>3. Data Backup, Export & Reset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            All farm data is stored in MongoDB Atlas. You can export a complete
            backup JSON file, import a saved snapshot, or reset to the default
            demo seed dataset at any time.
          </p>

          {importStatus && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-800 text-xs">
              {importStatus}
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs">
              Database successfully reset to clean seed data! Reloading...
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-1.5 text-xs text-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-600" /> Export Data (JSON)
            </Button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Import Data (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetSeed}
              className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 ml-auto"
            >
              <RefreshCw className="w-4 h-4" /> Reset to Demo Seed Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
