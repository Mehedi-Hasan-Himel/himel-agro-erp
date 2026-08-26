"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pigeon, PigeonSex, PigeonSource, PigeonStatus } from "@/types/pigeon";
import { BreedConfig } from "@/types/breed";
import { getPigeons, createPigeon, updatePigeon } from "@/lib/repositories/pigeonRepository";
import { getBreeds } from "@/lib/repositories/settingsRepository";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { AlertCircle, CheckCircle2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export interface PigeonFormProps {
  initialPigeon?: Pigeon;
  isEdit?: boolean;
  defaultFatherId?: string;
  defaultMotherId?: string;
  defaultHatchDate?: string;
}

export function PigeonForm({
  initialPigeon,
  isEdit = false,
  defaultFatherId,
  defaultMotherId,
  defaultHatchDate,
}: PigeonFormProps) {
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const todayStr = defaultHatchDate || new Date().toISOString().split("T")[0];

  // Form states
  const [ringYear, setRingYear] = useState<number>(
    initialPigeon?.ringYear || new Date(todayStr).getFullYear() || currentYear
  );
  const [ringSerial, setRingSerial] = useState<number>(
    initialPigeon?.ringSerial || 1
  );
  const [farmName, setFarmName] = useState<string>(
    initialPigeon?.farmName || "Himel Agro"
  );
  const [contactNumber, setContactNumber] = useState<string>(
    initialPigeon?.contactNumber || "01969038472"
  );
  const [hatchDate, setHatchDate] = useState<string>(
    initialPigeon?.hatchDate || todayStr
  );
  const [sex, setSex] = useState<PigeonSex>(initialPigeon?.sex || "UNKNOWN");
  const [breed, setBreed] = useState<string>(
    initialPigeon?.breed || "Giribaz / Local"
  );
  const [breedSubtype, setBreedSubtype] = useState<string>(
    initialPigeon?.breedSubtype || "Standard Giribaz"
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialPigeon?.photoUrl || ""
  );

  const [fatherId, setFatherId] = useState<string>(
    initialPigeon?.fatherId || defaultFatherId || ""
  );
  const [motherId, setMotherId] = useState<string>(
    initialPigeon?.motherId || defaultMotherId || ""
  );

  const [source, setSource] = useState<PigeonSource>(
    initialPigeon?.source || "BORN_HIMEL_AGRO"
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(
    initialPigeon?.purchaseDate || ""
  );
  const [purchasePrice, setPurchasePrice] = useState<string>(
    initialPigeon?.purchasePrice ? String(initialPigeon.purchasePrice) : ""
  );
  const [seller, setSeller] = useState<string>(initialPigeon?.seller || "");

  const [status, setStatus] = useState<PigeonStatus>(
    initialPigeon?.status || "ACTIVE"
  );
  const [firstFlyingDate, setFirstFlyingDate] = useState<string>(
    initialPigeon?.firstFlyingDate || ""
  );
  const [notes, setNotes] = useState<string>(initialPigeon?.notes || "");

  // Available options
  const [pigeonsList, setPigeonsList] = useState<Pigeon[]>([]);
  const [breedConfig, setBreedConfig] = useState<BreedConfig | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [allPigeons, breeds] = await Promise.all([
        getPigeons(),
        getBreeds(),
      ]);
      setPigeonsList(allPigeons);
      setBreedConfig(breeds);

      // Auto-suggest next ring serial for current year if creating new
      if (!isEdit && !initialPigeon) {
        const yearPigeons = allPigeons.filter((p) => p.ringYear === ringYear);
        const maxSerial = yearPigeons.reduce(
          (max, p) => Math.max(max, p.ringSerial || 0),
          0
        );
        setRingSerial(maxSerial + 1);
      }
    }
    loadData();
  }, [ringYear, isEdit, initialPigeon]);

  // Sync ring year when hatch date changes
  const handleHatchDateChange = (val: string) => {
    setHatchDate(val);
    if (val) {
      const hYear = new Date(val).getFullYear();
      if (!isNaN(hYear) && !isEdit) {
        setRingYear(hYear);
      }
    }
  };

  // Male & Female lists for parent pickers
  const availableMales = pigeonsList.filter(
    (p) => p.sex === "MALE" && p.id !== initialPigeon?.id
  );
  const availableFemales = pigeonsList.filter(
    (p) => p.sex === "FEMALE" && p.id !== initialPigeon?.id
  );

  // Available subtypes for selected breed category
  const activeCategory = breedConfig?.categories.find(
    (c) => c.name.toLowerCase() === breed.toLowerCase()
  );
  const availableSubtypes = activeCategory ? activeCategory.subtypes : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate Hatch Year === Ring Year
      const parsedHatchYear = new Date(hatchDate).getFullYear();
      if (parsedHatchYear !== ringYear) {
        throw new Error(
          `Validation Error: Ring year (${ringYear}) must match hatch date year (${parsedHatchYear}).`
        );
      }

      if (isEdit && initialPigeon) {
        await updatePigeon(initialPigeon.id, {
          ringYear,
          ringSerial,
          farmName,
          contactNumber,
          hatchDate,
          sex,
          breed,
          breedSubtype,
          photoUrl,
          fatherId: fatherId || null,
          motherId: motherId || null,
          source,
          purchaseDate: source === "PURCHASED" ? purchaseDate : undefined,
          purchasePrice:
            source === "PURCHASED" && purchasePrice
              ? parseFloat(purchasePrice)
              : undefined,
          seller: source === "PURCHASED" ? seller : undefined,
          status,
          firstFlyingDate: firstFlyingDate || undefined,
          notes,
        });

        router.push(`/pigeons/${initialPigeon.id}`);
      } else {
        const created = await createPigeon({
          ringYear,
          ringSerial,
          farmName,
          contactNumber,
          hatchDate,
          sex,
          breed,
          breedSubtype,
          photoUrl,
          fatherId: fatherId || null,
          motherId: motherId || null,
          source,
          purchaseDate: source === "PURCHASED" ? purchaseDate : undefined,
          purchasePrice:
            source === "PURCHASED" && purchasePrice
              ? parseFloat(purchasePrice)
              : undefined,
          seller: source === "PURCHASED" ? seller : undefined,
          status,
          firstFlyingDate: firstFlyingDate || undefined,
          notes,
        });

        router.push(`/pigeons/${created.id}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while saving the pigeon.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={isEdit && initialPigeon ? `/pigeons/${initialPigeon.id}` : "/pigeons"}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to{" "}
            {isEdit ? "Pigeon Profile" : "Pigeons List"}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? `Edit Pigeon ${initialPigeon?.id}` : "Register New Pigeon"}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit
              ? "Update pigeon details, lineage relationships, or lifecycle notes."
              : "Enter physical ring tag details, lineage, and physical classification."}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                isEdit && initialPigeon ? `/pigeons/${initialPigeon.id}` : "/pigeons"
              )
            }
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isEdit ? "Save Changes" : "Register Pigeon"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold">Unable to Save Pigeon</h5>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Section 1: Physical Ring Identity */}
      <Card>
        <CardHeader>
          <CardTitle>1. Physical Ring Identity</CardTitle>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Display: {ringYear} | {farmName} | {String(ringSerial).padStart(2, "0")} | {contactNumber}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Ring Year"
              type="number"
              min={2020}
              max={2035}
              value={ringYear}
              onChange={(e) => setRingYear(parseInt(e.target.value, 10) || currentYear)}
              required
              helperText="Year pigeon hatched"
            />
            <Input
              label="Ring Serial"
              type="number"
              min={1}
              max={999}
              value={ringSerial}
              onChange={(e) => setRingSerial(parseInt(e.target.value, 10) || 1)}
              required
              helperText="Starts from 01 each year"
            />
            <Input
              label="Farm Name"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              required
            />
            <Input
              label="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hatch / Birth Date"
              type="date"
              value={hatchDate}
              onChange={(e) => handleHatchDateChange(e.target.value)}
              required
              helperText="Must match ring year"
            />
            <Select
              label="Lifecycle Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PigeonStatus)}
              required
            >
              <option value="ACTIVE">ACTIVE (In Farm)</option>
              <option value="SOLD">SOLD (Sold to buyer)</option>
              <option value="DEAD">DEAD (Deceased)</option>
              <option value="LOST">LOST (Lost in flight/weather)</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Classification & Breed */}
      <Card>
        <CardHeader>
          <CardTitle>2. Classification & Genetics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Sex / Gender"
              value={sex}
              onChange={(e) => setSex(e.target.value as PigeonSex)}
              required
            >
              <option value="UNKNOWN">Baby / Unknown</option>
              <option value="MALE">Cock (Male ♂)</option>
              <option value="FEMALE">Hen (Female ♀)</option>
            </Select>

            <Select
              label="Breed Category"
              value={breed}
              onChange={(e) => {
                const newBreed = e.target.value;
                setBreed(newBreed);
                const cat = breedConfig?.categories.find(
                  (c) => c.name.toLowerCase() === newBreed.toLowerCase()
                );
                if (cat && cat.subtypes.length > 0) {
                  setBreedSubtype(cat.subtypes[0]);
                }
              }}
              required
            >
              {breedConfig?.categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </Select>

            <Select
              label="Breed Sub-type"
              value={breedSubtype}
              onChange={(e) => setBreedSubtype(e.target.value)}
            >
              {availableSubtypes.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Parentage (Genealogy) */}
      <Card>
        <CardHeader>
          <CardTitle>3. Parentage & Ancestry</CardTitle>
          <span className="text-xs text-slate-500">
            Select biological father and mother for dynamic pedigree generation.
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Father selector */}
            <Select
              label="Biological Father (Sire)"
              value={fatherId}
              onChange={(e) => setFatherId(e.target.value)}
              helperText="Only verified MALE pigeons are eligible"
            >
              <option value="">-- Unknown / Unregistered Father --</option>
              {availableMales.map((male) => (
                <option key={male.id} value={male.id}>
                  {formatCompactRing(male)} — {male.breedSubtype || male.breed} ({male.ringYear})
                </option>
              ))}
            </Select>

            {/* Mother selector */}
            <Select
              label="Biological Mother (Dam)"
              value={motherId}
              onChange={(e) => setMotherId(e.target.value)}
              helperText="Only verified FEMALE pigeons are eligible"
            >
              <option value="">-- Unknown / Unregistered Mother --</option>
              {availableFemales.map((female) => (
                <option key={female.id} value={female.id}>
                  {formatCompactRing(female)} — {female.breedSubtype || female.breed} ({female.ringYear})
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Source & Acquisition */}
      <Card>
        <CardHeader>
          <CardTitle>4. Source & Acquisition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pigeon Origin"
              value={source}
              onChange={(e) => setSource(e.target.value as PigeonSource)}
              required
            >
              <option value="BORN_HIMEL_AGRO">Born at Himel Agro</option>
              <option value="PURCHASED">Purchased / Outside Bloodline</option>
            </Select>

            {source === "PURCHASED" && (
              <Input
                label="Purchase Date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            )}
          </div>

          {source === "PURCHASED" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <Input
                label="Purchase Price (৳ BDT)"
                type="number"
                min={0}
                placeholder="e.g. 4500"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                helperText="Will be recorded in farm expenses"
              />
              <Input
                label="Seller / Source Loft"
                placeholder="e.g. Old Town Pigeon Club"
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Performance & Media */}
      <Card>
        <CardHeader>
          <CardTitle>5. Flight Records & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Flying / Release Date"
              type="date"
              value={firstFlyingDate}
              onChange={(e) => setFirstFlyingDate(e.target.value)}
              helperText="Date bird took its first roof toss or training flight"
            />
            <Input
              label="Photo URL (Optional)"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              helperText="Pigeon portrait URL or image link"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes & Physical Description
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eye sign, wing feathers, flight stamina, special markings..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              isEdit && initialPigeon ? `/pigeons/${initialPigeon.id}` : "/pigeons"
            )
          }
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="gap-2"
        >
          <Save className="w-5 h-5" />
          {isEdit ? "Update Pigeon Record" : "Save and Register Pigeon"}
        </Button>
      </div>
    </form>
  );
}
