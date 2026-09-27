"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Goat, GoatSex, GoatStatus, GoatHornStatus } from "@/types/goat";
import { createGoat, getGoats, generateGoatTagNumber } from "@/lib/repositories/goatRepository";
import { ArrowLeft, Save, PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterGoatPage() {
  const router = useRouter();
  const [existingGoats, setExistingGoats] = useState<Goat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tagNumber, setTagNumber] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("Black Bengal");
  const [breedSubtype, setBreedSubtype] = useState("");
  const [color, setColor] = useState("Jet Black");
  const [sex, setSex] = useState<GoatSex>("FEMALE");
  const [birthDate, setBirthDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightKg, setWeightKg] = useState<string>("15");
  const [hornStatus, setHornStatus] = useState<GoatHornStatus>("POLLED");
  const [status, setStatus] = useState<GoatStatus>("ACTIVE");
  const [pregnancyStatus, setPregnancyStatus] = useState<"NOT_PREGNANT" | "PREGNANT" | "LACTATING">("NOT_PREGNANT");
  const [expectedKiddingDate, setExpectedKiddingDate] = useState("");
  const [penLocation, setPenLocation] = useState("Doe Pen 1");
  const [source, setSource] = useState<"BORN_HIMEL_AGRO" | "PURCHASED">("BORN_HIMEL_AGRO");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [seller, setSeller] = useState("");
  const [fatherId, setFatherId] = useState<string>("");
  const [motherId, setMotherId] = useState<string>("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getGoats().then((list) => {
      setExistingGoats(list);
      setTagNumber(generateGoatTagNumber(list.length));
    });
  }, []);

  const bucks = existingGoats.filter((g) => g.sex === "MALE");
  const does = existingGoats.filter((g) => g.sex === "FEMALE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!tagNumber.trim()) throw new Error("Ear Tag Number is required.");
      if (!breed.trim()) throw new Error("Breed is required.");

      const selectedSire = bucks.find((b) => b.id === fatherId);
      const selectedDam = does.find((d) => d.id === motherId);

      const created = await createGoat({
        sectorId: "GOAT",
        tagNumber: tagNumber.trim(),
        name: name.trim() || undefined,
        breed: breed.trim(),
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
        source,
        purchasePrice: source === "PURCHASED" && purchasePrice ? parseFloat(purchasePrice) : undefined,
        purchaseDate: source === "PURCHASED" && purchaseDate ? purchaseDate : undefined,
        seller: source === "PURCHASED" && seller.trim() ? seller.trim() : undefined,
        fatherId: fatherId || null,
        fatherDetails: selectedSire ? `${selectedSire.name || ""} (${selectedSire.tagNumber})` : undefined,
        motherId: motherId || null,
        motherDetails: selectedDam ? `${selectedDam.name || ""} (${selectedDam.tagNumber})` : undefined,
        notes: notes.trim() || undefined,
      });

      router.push(`/goats/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register goat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/goats"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Goat Herd Registry</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Register New Goat (🐐 Sector)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Record unique ear tag ID, pedigree parentage, breed strain, weight, and initial health status.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            1. Core Identity & Physical Traits
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Ear Tag Number *
              </label>
              <input
                type="text"
                required
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                placeholder="e.g. HA-GT-09"
                className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Goat Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Badal, Shurjo"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender / Sex *
              </label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Breed *
              </label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Black Bengal, Jamunapari, Boer Cross"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Breed Subtype / Line
              </label>
              <input
                type="text"
                value={breedSubtype}
                onChange={(e) => setBreedSubtype(e.target.value)}
                placeholder="e.g. High Fecundity, Dairy Line"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coat Color / Pattern
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Jet Black, Brown Patch, White"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth / Kidding *
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 24.5"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horn Status
              </label>
              <select
                value={hornStatus}
                onChange={(e) => setHornStatus(e.target.value as GoatHornStatus)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="POLLED">Polled (Naturally Hornless)</option>
                <option value="HORNED">Horned</option>
                <option value="DISBUDDED">Disbudded (Dehorned)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status & Reproductive State */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            2. Herd Status & Reproductive State
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                General Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoatStatus)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="ACTIVE">Active in Herd</option>
                <option value="PREGNANT">Pregnant (Gestation)</option>
                <option value="LACTATING">Lactating</option>
                <option value="QUARANTINED">Quarantined / Sick Bay</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>

            {sex === "FEMALE" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pregnancy / Breeding State
                  </label>
                  <select
                    value={pregnancyStatus}
                    onChange={(e) => setPregnancyStatus(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="NOT_PREGNANT">Open / Not Pregnant</option>
                    <option value="PREGNANT">Confirmed Pregnant</option>
                    <option value="LACTATING">Lactating Dam</option>
                  </select>
                </div>

                {pregnancyStatus === "PREGNANT" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expected Kidding Due Date
                    </label>
                    <input
                      type="date"
                      value={expectedKiddingDate}
                      onChange={(e) => setExpectedKiddingDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pen / Paddock Location
              </label>
              <input
                type="text"
                value={penLocation}
                onChange={(e) => setPenLocation(e.target.value)}
                placeholder="e.g. Buck Shed 1, Doe Pen B"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pedigree Parentage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            3. Pedigree Parentage (Sire & Dam)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sire (Father Buck)
              </label>
              <select
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Unknown / Foundation Sire</option>
                {bucks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.tagNumber} - {b.name || "Buck"} ({b.breed})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dam (Mother Doe)
              </label>
              <select
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Unknown / Foundation Dam</option>
                {does.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.tagNumber} - {d.name || "Doe"} ({d.breed})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Acquisition & Financial Source */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            4. Acquisition & Financial Source
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Type
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="BORN_HIMEL_AGRO">Born at Himel Agro Farm</option>
                <option value="PURCHASED">Purchased from External Farm</option>
              </select>
            </div>

            {source === "PURCHASED" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Price (৳ BDT)
                  </label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="e.g. 14000"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seller / Breeder Farm
                  </label>
                  <input
                    type="text"
                    value={seller}
                    onChange={(e) => setSeller(e.target.value)}
                    placeholder="e.g. Chuadanga Farm"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              General Notes / Observation
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Physical conformation, vigor, vaccination remarks..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/goats"
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? "Saving..." : "Save Goat to Registry"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
