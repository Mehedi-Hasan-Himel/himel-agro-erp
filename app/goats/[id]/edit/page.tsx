"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Goat, GoatSex, GoatStatus, GoatHornStatus } from "@/types/goat";
import { getGoatById, updateGoat } from "@/lib/repositories/goatRepository";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

export default function EditGoatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tagNumber, setTagNumber] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [breedSubtype, setBreedSubtype] = useState("");
  const [color, setColor] = useState("");
  const [sex, setSex] = useState<GoatSex>("FEMALE");
  const [birthDate, setBirthDate] = useState("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [hornStatus, setHornStatus] = useState<GoatHornStatus>("POLLED");
  const [status, setStatus] = useState<GoatStatus>("ACTIVE");
  const [pregnancyStatus, setPregnancyStatus] = useState<"NOT_PREGNANT" | "PREGNANT" | "LACTATING">("NOT_PREGNANT");
  const [expectedKiddingDate, setExpectedKiddingDate] = useState("");
  const [penLocation, setPenLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    getGoatById(id).then((g) => {
      if (g) {
        setTagNumber(g.tagNumber);
        setName(g.name || "");
        setBreed(g.breed);
        setBreedSubtype(g.breedSubtype || "");
        setColor(g.color || "");
        setSex(g.sex as GoatSex);
        setBirthDate(g.birthDate || "");
        setWeightKg(g.weightKg ? String(g.weightKg) : "");
        setHornStatus(g.hornStatus || "POLLED");
        setStatus(g.status as GoatStatus);
        setPregnancyStatus(g.pregnancyStatus || "NOT_PREGNANT");
        setExpectedKiddingDate(g.expectedKiddingDate || "");
        setPenLocation(g.penLocation || "");
        setNotes(g.notes || "");
      }
      setIsLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await updateGoat(id, {
        tagNumber,
        name: name.trim() || undefined,
        breed,
        breedSubtype: breedSubtype.trim() || undefined,
        color: color.trim() || undefined,
        sex,
        birthDate,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        hornStatus,
        status,
        pregnancyStatus: sex === "FEMALE" ? pregnancyStatus : undefined,
        expectedKiddingDate: pregnancyStatus === "PREGNANT" && expectedKiddingDate ? expectedKiddingDate : undefined,
        penLocation: penLocation.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      router.push(`/goats/${encodeURIComponent(id)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update goat record");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading goat profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href={`/goats/${encodeURIComponent(id)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dossier</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Edit Goat: {tagNumber} ({name || "Goat"})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Update weight, reproductive state, status, or housing location.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ear Tag Number</label>
            <input
              type="text"
              required
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Breed</label>
            <input
              type="text"
              required
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as GoatSex)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="FEMALE">♀ Doe (Female)</option>
              <option value="MALE">♂ Buck (Male)</option>
              <option value="CASTRATED_MALE">Wether (Castrated Male)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as GoatStatus)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="PREGNANT">Pregnant</option>
              <option value="LACTATING">Lactating</option>
              <option value="QUARANTINED">Quarantined</option>
              <option value="SOLD">Sold</option>
              <option value="DEAD">Dead</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Housing Pen</label>
            <input
              type="text"
              value={penLocation}
              onChange={(e) => setPenLocation(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Kidding Date</label>
            <input
              type="date"
              value={expectedKiddingDate}
              onChange={(e) => setExpectedKiddingDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Link
            href={`/goats/${encodeURIComponent(id)}`}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
