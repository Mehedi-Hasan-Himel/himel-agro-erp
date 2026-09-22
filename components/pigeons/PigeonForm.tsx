"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pigeon, PigeonSex, PigeonSource, PigeonStatus } from "@/types/pigeon";
import { BreedConfig } from "@/types/breed";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import {
  getPigeons,
  createPigeon,
  updatePigeon,
  generatePigeonId,
} from "@/lib/repositories/pigeonRepository";
import { getBreeds } from "@/lib/repositories/settingsRepository";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { AlertCircle, Save, ArrowLeft, Trash2, Image as ImageIcon } from "lucide-react";
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
    initialPigeon?.farmName || SITE_CONFIG.shortName
  );
  const [contactNumber, setContactNumber] = useState<string>(
    initialPigeon?.contactNumber || SITE_CONFIG.contactNumber
  );
  const [hatchDate, setHatchDate] = useState<string>(
    initialPigeon?.hatchDate || todayStr
  );
  const [sex, setSex] = useState<PigeonSex>(initialPigeon?.sex || "UNKNOWN");
  const [breed, setBreed] = useState<string>(
    initialPigeon?.breed === "Giribaz / Local"
      ? "Giribaz"
      : initialPigeon?.breed || "Giribaz"
  );
  const [breedSubtype, setBreedSubtype] = useState<string>(
    initialPigeon?.breedSubtype || "Standard Giribaz"
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialPigeon?.photoUrl || ""
  );
  const [photos, setPhotos] = useState<string[]>(() => {
    const arr = [...(initialPigeon?.photos || [])];
    if (initialPigeon?.photoUrl && !arr.includes(initialPigeon.photoUrl)) {
      arr.unshift(initialPigeon.photoUrl);
    }
    return arr;
  });
  const [galleryInput, setGalleryInput] = useState<string>("");
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const [fatherId, setFatherId] = useState<string>(
    initialPigeon?.fatherId || defaultFatherId || ""
  );
  const [motherId, setMotherId] = useState<string>(
    initialPigeon?.motherId || defaultMotherId || ""
  );
  const [clutchId, setClutchId] = useState<string>(
    initialPigeon?.clutchId || ""
  );
  const [videos, setVideos] = useState<string[]>(
    initialPigeon?.videos || []
  );
  const [videoInput, setVideoInput] = useState<string>("");

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
  const [isForSale, setIsForSale] = useState<boolean>(
    initialPigeon?.isForSale || false
  );
  const [askingPrice, setAskingPrice] = useState<string>(
    initialPigeon?.askingPrice ? String(initialPigeon.askingPrice) : ""
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

  useEffect(() => {
    if (initialPigeon) {
      const arr = [...(initialPigeon.photos || [])];
      if (initialPigeon.photoUrl && !arr.includes(initialPigeon.photoUrl)) {
        arr.unshift(initialPigeon.photoUrl);
      }
      setPhotos(arr);
      setPhotoUrl(initialPigeon.photoUrl || "");
    }
  }, [initialPigeon]);

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

  // Dynamic Unique ID: year + ring number + breed (Giribaz, Racer) + Breed Sub-type + gender (e.g. 2026-01-GCF)
  const dynamicUniqueId = generatePigeonId(
    ringYear,
    ringSerial,
    breed,
    breedSubtype,
    sex
  );

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

      const finalPhotos = Array.from(
        new Set([...photos, photoUrl].filter(Boolean))
      );

      if (isEdit && initialPigeon) {
        await updatePigeon(initialPigeon.id, {
          id: dynamicUniqueId,
          ringYear,
          ringSerial,
          farmName,
          contactNumber,
          hatchDate,
          birthDate: hatchDate,
          clutchId: clutchId.trim() || undefined,
          sex,
          breed,
          breedSubtype,
          photoUrl: photoUrl || (finalPhotos.length > 0 ? finalPhotos[0] : ""),
          photos: finalPhotos,
          videos,
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
          isForSale,
          askingPrice: isForSale && askingPrice ? parseFloat(askingPrice) : undefined,
          firstFlyingDate: firstFlyingDate || undefined,
          notes,
        });

        router.push(`/pigeons/${dynamicUniqueId}`);
      } else {
        const created = await createPigeon({
          id: dynamicUniqueId,
          ringYear,
          ringSerial,
          farmName,
          contactNumber,
          hatchDate,
          birthDate: hatchDate,
          clutchId: clutchId.trim() || undefined,
          sex,
          breed,
          breedSubtype,
          photoUrl: photoUrl || (finalPhotos.length > 0 ? finalPhotos[0] : ""),
          photos: finalPhotos,
          videos,
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
          isForSale,
          askingPrice: isForSale && askingPrice ? parseFloat(askingPrice) : undefined,
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
            href={isEdit && initialPigeon ? `/pigeons/${dynamicUniqueId}` : "/pigeons"}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to{" "}
            {isEdit ? "Pigeon Profile" : "Pigeons List"}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? `Edit Pigeon ${dynamicUniqueId}` : "Register New Pigeon"}
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
                isEdit && initialPigeon ? `/pigeons/${dynamicUniqueId}` : "/pigeons"
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg shadow-2xs">
              Unique ID: {dynamicUniqueId}
            </span>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hidden sm:inline-block">
              Tag: {ringYear} | {farmName} | {String(ringSerial).padStart(2, "0")} | {contactNumber}
            </span>
          </div>
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
              <option value="MALE">Male (♂)</option>
              <option value="FEMALE">Female (♀)</option>
              <option value="UNKNOWN">Baby / Unknown</option>
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
                  {cat.name} ({cat.name.charAt(0).toUpperCase()})
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

            {/* Clutch / Batch ID */}
            <div className="sm:col-span-2">
              <Input
                label="Egg Batch / Clutch ID (Optional)"
                placeholder="e.g. 2026-C01"
                value={clutchId}
                onChange={(e) => setClutchId(e.target.value)}
                helperText="Same clutch ID identifies twin clutch-mates hatched from the same nest"
              />
            </div>
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
              <option value="BORN_HIMEL_AGRO">Born at Himel's Pet House</option>
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

      {/* Section 5: Commercial & Sales Listing */}
      <Card className={isForSale ? "border-emerald-300 ring-1 ring-emerald-300/40 bg-emerald-50/20" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>5. Commercial & Sales Listing</CardTitle>
              <span className="text-xs text-slate-500">
                Mark this pigeon as available for enthusiasts and pigeon buyers.
              </span>
            </div>
            {isForSale && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Available for Sale
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={isForSale}
              onChange={(e) => setIsForSale(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">
                List this pigeon as &quot;Available for Sale&quot;
              </span>
              <span className="text-slate-500">
                Bird will appear in the &quot;Available Sale&quot; dashboard count and sales directory.
              </span>
            </div>
          </label>

          {isForSale && (
            <div className="pt-2">
              <Input
                label="Asking / Listing Price (৳ BDT)"
                type="number"
                min={0}
                placeholder="e.g. 5000"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                helperText="Expected price for enthusiasts (can be negotiated at time of sale)"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 6: Performance & Media */}
      <Card>
        <CardHeader>
          <CardTitle>6. Flight Records & Notes</CardTitle>
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
            <div>
              <Input
                label="Primary Portrait Photo URL (Optional)"
                placeholder="https://..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                helperText="Main avatar portrait for registry & pedigree"
              />
              {photoUrl && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    <img
                      src={photoUrl}
                      alt="Primary Portrait Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Primary Photo Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Images & Media Upload Link */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Gallery Images & Media ({photos.length})
                </label>
                <p className="text-xs text-slate-500">
                  Add image links for high-res loft photos, eye signs, and wing plumage documentation.
                </p>
              </div>
            </div>

            {/* Input to add image link to gallery */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Paste Image URL (e.g. Imgur, Cloudinary, Drive link)"
                  value={galleryInput}
                  onChange={(e) => {
                    setGalleryInput(e.target.value);
                    setGalleryError(null);
                  }}
                  className="bg-white text-xs"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = galleryInput.trim();
                  if (!url) {
                    setGalleryError("Please enter an image URL");
                    return;
                  }
                  if (photos.includes(url)) {
                    setGalleryError("Image URL is already added to the gallery");
                    return;
                  }
                  setPhotos([...photos, url]);
                  if (!photoUrl) {
                    setPhotoUrl(url);
                  }
                  setGalleryInput("");
                }}
                className="gap-1.5 shrink-0 text-xs font-bold"
              >
                <ImageIcon className="w-3.5 h-3.5" /> + Add to Gallery
              </Button>
            </div>

            {galleryError && (
              <p className="text-xs text-rose-600 font-semibold">{galleryError}</p>
            )}

            {/* Gallery Thumbnails List with preview and actions */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                {photos.map((pUrl, idx) => {
                  const isPrimary = photoUrl === pUrl;
                  return (
                    <div
                      key={idx}
                      className={`relative group aspect-square rounded-xl overflow-hidden border bg-slate-100 shadow-2xs ${
                        isPrimary
                          ? "ring-2 ring-emerald-500 border-emerald-400"
                          : "border-slate-200"
                      }`}
                    >
                      <img
                        src={pUrl}
                        alt={`Gallery Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.opacity = "0.3";
                        }}
                      />
                      {isPrimary && (
                        <div className="absolute top-1 left-1">
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            ★ Primary
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex flex-col justify-between">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = photos.filter((p) => p !== pUrl);
                              setPhotos(updated);
                              if (photoUrl === pUrl) {
                                setPhotoUrl(updated.length > 0 ? updated[0] : "");
                              }
                            }}
                            className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPhotoUrl(pUrl)}
                            className="bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-800 text-[9px] font-bold py-0.5 px-1 rounded shadow-xs cursor-pointer"
                          >
                            Set Main
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Video Gallery Links */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Video Links & Loft Clips ({videos.length})
              </label>
              <p className="text-xs text-slate-500">
                Add YouTube, Facebook, or direct MP4 video links for flight records, shows, and training.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Paste YouTube or Video URL (e.g. https://youtu.be/...)"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  className="bg-white text-xs"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = videoInput.trim();
                  if (!url) return;
                  if (videos.includes(url)) return;
                  setVideos([...videos, url]);
                  setVideoInput("");
                }}
                className="gap-1.5 shrink-0 text-xs font-bold"
              >
                + Add Video Link
              </Button>
            </div>

            {videos.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {videos.map((vid, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-mono text-[11px] truncate max-w-md text-slate-700">
                      {vid}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-600 hover:text-rose-800"
                      title="Remove Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
