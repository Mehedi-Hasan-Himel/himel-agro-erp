"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Goat } from "@/types/goat";
import { getGoatById, getGoats, deleteGoat } from "@/lib/repositories/goatRepository";
import { calculateKinship } from "@/lib/calculations/genericKinshipCalculator";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import {
  ArrowLeft,
  GitFork,
  Edit,
  Trash2,
  Calendar,
  Weight,
  MapPin,
  Heart,
  Activity,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";

export default function GoatDossierPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [goat, setGoat] = useState<Goat | null>(null);
  const [allGoats, setAllGoats] = useState<Goat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getGoatById(id), getGoats()]).then(([g, list]) => {
      setGoat(g);
      setAllGoats(list);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading goat dossier...
      </div>
    );
  }

  if (!goat) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Goat Not Found</h2>
        <p className="text-xs text-slate-500">No goat record matches identifier &quot;{id}&quot;.</p>
        <Link
          href="/goats"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Registry</span>
        </Link>
      </div>
    );
  }

  const kinship = calculateKinship(goat, allGoats);

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return "Unknown";
    const birth = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMonths = Math.floor((now - birth) / (1000 * 60 * 60 * 24 * 30.4375));
    if (diffMonths < 1) return "Less than 1 month";
    if (diffMonths < 12) return `${diffMonths} months`;
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} years`;
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete goat ${goat.tagNumber} (${goat.name || "Goat"})?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteGoat(goat.id);
      router.push("/goats");
    } catch (e) {
      alert("Failed to delete goat");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/goats"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Herd Registry</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/goats/${goat.id}/pedigree`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            <GitFork className="w-4 h-4 text-emerald-600" />
            <span>Pedigree Tree</span>
          </Link>
          <Link
            href={`/goats/${goat.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl shrink-0 shadow-xs">
              🐐
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-black text-amber-900 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-lg">
                  {goat.tagNumber}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    goat.sex === "MALE"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : goat.sex === "FEMALE"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {goat.sex === "MALE" ? "♂ Buck (Sire)" : goat.sex === "FEMALE" ? "♀ Doe (Dam)" : "Wether"}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {goat.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {goat.name || `Goat ${goat.tagNumber}`}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {goat.breed} {goat.breedSubtype ? `(${goat.breedSubtype})` : ""} • Coat: {goat.color || "Standard"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 min-w-48 text-right space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Gestation / Reproductive State
            </span>
            <div className="font-bold text-slate-800 text-sm">
              {goat.pregnancyStatus === "PREGNANT"
                ? "💖 Pregnant (Due Soon)"
                : goat.pregnancyStatus === "LACTATING"
                ? "🍼 Nursing Kid(s)"
                : "Open / Normal"}
            </div>
            {goat.expectedKiddingDate && (
              <span className="text-xs text-pink-600 font-semibold block">
                Due: {formatDate(goat.expectedKiddingDate)}
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Age</span>
            <span className="font-bold text-slate-800 font-mono text-sm">{calculateAge(goat.birthDate || "")}</span>
            <span className="text-[10px] text-slate-400 block">{formatDate(goat.birthDate || "")}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Body Weight</span>
            <span className="font-bold text-slate-800 font-mono text-sm">
              {goat.weightKg ? `${goat.weightKg} kg` : "Not weighed"}
            </span>
            <span className="text-[10px] text-slate-400 block">Horn: {goat.hornStatus || "Polled"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Housing Location</span>
            <span className="font-bold text-slate-800 text-sm truncate block">{goat.penLocation || "Paddock"}</span>
            <span className="text-[10px] text-slate-400 block">Himel Agro Facility</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Acquisition</span>
            <span className="font-bold text-slate-800 text-sm">
              {goat.source === "BORN_HIMEL_AGRO" ? "Born on Farm" : "Purchased"}
            </span>
            {goat.purchasePrice && (
              <span className="text-[10px] text-emerald-700 font-bold block">
                Cost: {formatCurrency(goat.purchasePrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Kinship & Genetics Engine Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Kinship & Family Genealogy ({kinship.totalRelationsCount} Kinship Connections)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-generational kinship relations computed by the Deterministic Kinship Engine.
            </p>
          </div>
          <Link
            href={`/goats/${goat.id}/pedigree`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs"
          >
            <span>Open Pedigree Chart</span>
            <span>→</span>
          </Link>
        </div>

        {/* Immediate Parents (Sire & Dam) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sire */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 block">
              Sire (Father Buck)
            </span>
            {kinship.father ? (
              <Link
                href={`/goats/${kinship.father.id}`}
                className="flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {kinship.father.name || "Sire"} ({kinship.father.tagNumber})
                  </div>
                  <div className="text-[11px] text-slate-500">{kinship.father.breed}</div>
                </div>
                <span className="text-xs text-blue-600 font-semibold group-hover:underline">View →</span>
              </Link>
            ) : (
              <div className="text-xs text-slate-500 italic">
                {goat.fatherDetails || "Foundation sire / Unknown"}
              </div>
            )}
          </div>

          {/* Dam */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 block">
              Dam (Mother Doe)
            </span>
            {kinship.mother ? (
              <Link
                href={`/goats/${kinship.mother.id}`}
                className="flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    {kinship.mother.name || "Dam"} ({kinship.mother.tagNumber})
                  </div>
                  <div className="text-[11px] text-slate-500">{kinship.mother.breed}</div>
                </div>
                <span className="text-xs text-rose-600 font-semibold group-hover:underline">View →</span>
              </Link>
            ) : (
              <div className="text-xs text-slate-500 italic">
                {goat.motherDetails || "Foundation dam / Unknown"}
              </div>
            )}
          </div>
        </div>

        {/* Twins / Littermates Section */}
        {kinship.twinSiblings.length > 0 && (
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-800 text-xs font-bold">
              <span>👯</span>
              <span>Twin / Littermate ({kinship.twinSiblings.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {kinship.twinSiblings.map((rel) => (
                <Link
                  key={rel.animal.id}
                  href={`/goats/${rel.animal.id}`}
                  className="p-2.5 rounded-xl bg-white border border-purple-100 flex items-center justify-between hover:border-purple-300 transition-all text-xs"
                >
                  <span className="font-bold text-slate-800">
                    {rel.animal.name || "Twin"} ({rel.animal.tagNumber})
                  </span>
                  <span className="text-[11px] text-purple-600 font-semibold">50% shared DNA</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Siblings Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700">
              Full Siblings ({kinship.fullSiblings.length})
            </span>
            {kinship.fullSiblings.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No full siblings registered.</div>
            ) : (
              <div className="space-y-1.5">
                {kinship.fullSiblings.map((rel) => (
                  <Link
                    key={rel.animal.id}
                    href={`/goats/${rel.animal.id}`}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 text-xs"
                  >
                    <span className="font-medium text-slate-800">
                      {rel.animal.name || "Sibling"} ({rel.animal.tagNumber})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Full Sibling</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {(() => {
              const allHalf = [...kinship.maternalHalfSiblings, ...kinship.paternalHalfSiblings];
              return (
                <>
                  <span className="text-xs font-bold text-slate-700">
                    Half-Siblings ({allHalf.length})
                  </span>
                  {allHalf.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No half-siblings registered.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {allHalf.map((rel) => (
                        <Link
                          key={rel.animal.id}
                          href={`/goats/${rel.animal.id}`}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 text-xs"
                        >
                          <span className="font-medium text-slate-800">
                            {rel.animal.name || "Goat"} ({rel.animal.tagNumber})
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {rel.relationshipCategory === "PATERNAL_HALF_SIBLING" ? "Via Sire" : "Via Dam"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Progeny / Offspring */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700">
            Offspring / Kids ({kinship.children.length})
          </span>
          {kinship.children.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No offspring registered for this goat.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {kinship.children.map((rel) => (
                <Link
                  key={rel.animal.id}
                  href={`/goats/${rel.animal.id}`}
                  className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between hover:bg-emerald-100/50 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {rel.animal.name || "Kid"} ({rel.animal.tagNumber})
                    </span>
                    <span className="text-[10px] text-slate-500">{rel.animal.breed}</span>
                  </div>
                  <span className="text-emerald-700 font-bold">Kid →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Observations & Notes */}
      {goat.notes && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Breeder Remarks & Notes
          </h3>
          <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
            {goat.notes}
          </p>
        </div>
      )}
    </div>
  );
}
