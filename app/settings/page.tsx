"use client";

import React, { useState, useEffect } from "react";
import { FarmSettings } from "@/types/settings";
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
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<FarmSettings | null>(null);
  const [breeds, setBreeds] = useState<BreedConfig | null>(null);
  const [newSubtype, setNewSubtype] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Giribaz / Local");

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [s, b] = await Promise.all([getSettings(), getBreeds()]);
      setSettings(s);
      setBreeds(b);
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingSettings(true);
    try {
      await updateSettings(settings);
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

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `himel-agro-erp-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      if (success) {
        setImportStatus("Database imported successfully! Refreshing data...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus("Failed to import JSON data. Please verify file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = () => {
    if (
      confirm(
        "Are you sure you want to reset all farm data back to the demo seed dataset (~40 pigeons, pairs, rounds, feed, transactions)?"
      )
    ) {
      resetToSeedData();
      setResetSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
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
          Loft identity, breed categories, currency specifications, and data
          backup tools.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Farm settings saved successfully!</span>
        </div>
      )}

      {/* 1. Farm Identity Settings */}
      <Card>
        <CardHeader>
          <CardTitle>1. Farm Profile & Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Farm Name"
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
                helperText="Appears on physical ring tag format"
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

      {/* 2. Breed Categories & Subtypes */}
      <Card>
        <CardHeader>
          <CardTitle>2. Breed Lineages & Subtypes</CardTitle>
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
            The MVP uses clean JSON repository storage with browser
            synchronization. You can export complete backup JSON files, import
            saved snapshots, or reset to the default demo seed dataset at any
            time.
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
