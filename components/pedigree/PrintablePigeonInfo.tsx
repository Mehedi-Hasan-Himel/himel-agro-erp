"use client";

import React from "react";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import { Pigeon } from "@/types/pigeon";
import { BreedingRound, HatchingStats } from "@/types/breeding";
import { FlyingRecord } from "@/types/flying";
import { HealthRecord } from "@/types/health";
import { FamilyTreeSummary } from "@/lib/calculations/relationshipCalculator";
import { formatRingNumber, formatCompactRing } from "@/lib/formatters/ringFormatter";
import { formatDate, calculateAge } from "@/lib/formatters/dateFormatter";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { ShieldCheck, Award, Calendar } from "lucide-react";

export interface PrintablePigeonInfoProps {
  pigeon: Pigeon;
  father?: Pigeon | null;
  mother?: Pigeon | null;
  familySummary?: FamilyTreeSummary | null;
  hatchingStats?: HatchingStats | null;
  flyingRecords?: FlyingRecord[];
  healthRecords?: HealthRecord[];
  id?: string;
}

export function PrintablePigeonInfo({
  pigeon,
  father,
  mother,
  familySummary,
  hatchingStats,
  flyingRecords = [],
  healthRecords = [],
  id = "printable-pigeon-info-pdf-view",
}: PrintablePigeonInfoProps) {
  const age = calculateAge(pigeon.birthDate || pigeon.hatchDate);
  const ringText = formatRingNumber(pigeon);

  return (
    <div
      id={id}
      className="w-full max-w-[850px] mx-auto bg-white p-8 sm:p-10 border-4 border-double border-emerald-800 rounded-xl shadow-lg print:border-2 print:shadow-none text-slate-800 font-sans"
    >
      {/* Official Header */}
      <div className="border-b-2 border-emerald-700 pb-5 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-emerald-50 ring-2 ring-emerald-600 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src={SITE_CONFIG.logoUrl}
              alt={`${SITE_CONFIG.farmName} Logo`}
              width={200}
              height={200}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider uppercase text-emerald-900 leading-tight">
              {SITE_CONFIG.farmName}
            </h1>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">
              {SITE_CONFIG.loftSubtitle}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Official Pigeon Dossier & Comprehensive History Record
            </p>
          </div>
        </div>

        <div className="text-right text-xs space-y-1">
          <div className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Record
          </div>
          <p className="text-slate-600 font-mono text-[11px]">
            Hotline: {SITE_CONFIG.contactNumber}
          </p>
          <p className="text-[10px] text-slate-400">
            Issued: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Top Banner: Dynamic Unique ID & Reformed Ring Number */}
      <div className="bg-slate-900 text-white rounded-xl p-5 mb-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-3 mb-3">
          <div className="flex items-center gap-4">
            {pigeon.photoUrl && (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-600 shrink-0">
                <img
                  src={pigeon.photoUrl}
                  alt={pigeon.id}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                Dynamic Unique ID
              </span>
              <h2 className="text-2xl font-mono font-extrabold text-white tracking-tight">
                {pigeon.id}
              </h2>
              <div className="mt-1.5 inline-block bg-emerald-600 text-white font-mono font-bold text-xs px-3 py-1 rounded-lg shadow-2xs">
                {ringText}
              </div>
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {pigeon.status}
            </span>
            <p className="text-slate-300 font-semibold text-xs">
              Sex: {pigeon.sex}
            </p>
            <p className="text-[11px] text-slate-400">
              Age: {age}
            </p>
          </div>
        </div>

        {/* Primary Details Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Breed</span>
            <span className="font-bold text-slate-100">{pigeon.breed}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sub-Type</span>
            <span className="font-bold text-slate-100">{pigeon.breedSubtype || "Standard"}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hatch Date</span>
            <span className="font-bold text-slate-100 font-mono">{formatDate(pigeon.birthDate || pigeon.hatchDate)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Loft Origin</span>
            <span className="font-bold text-slate-100">
              {pigeon.source === "BORN_HIMEL_AGRO" ? "Born at Himel Agro" : "Acquired / Purchased"}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Lineage & Kinship | Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Biological Lineage & Family */}
        <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 space-y-3 text-xs">
          <h3 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] border-b border-emerald-200 pb-1.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            Biological Lineage & Family
          </h3>

          <div className="space-y-2">
            <div className="p-2.5 bg-white rounded-lg border border-sky-200">
              <span className="text-[10px] font-bold text-sky-700 uppercase block">Biological Father (Sire)</span>
              {father ? (
                <div className="font-semibold text-slate-800">
                  <span className="font-mono text-sky-950">{formatCompactRing(father)}</span> — {father.breedSubtype || father.breed} ({father.ringYear})
                </div>
              ) : (
                <span className="text-slate-400 italic">Unregistered Sire</span>
              )}
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-pink-200">
              <span className="text-[10px] font-bold text-pink-700 uppercase block">Biological Mother (Dam)</span>
              {mother ? (
                <div className="font-semibold text-slate-800">
                  <span className="font-mono text-pink-950">{formatCompactRing(mother)}</span> — {mother.breedSubtype || mother.breed} ({mother.ringYear})
                </div>
              ) : (
                <span className="text-slate-400 italic">Unregistered Dam</span>
              )}
            </div>

            {familySummary && (
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Twin Siblings (Same Clutch):</span>
                  <span className="font-bold text-slate-800">{familySummary.twinSiblings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Siblings:</span>
                  <span className="font-bold text-slate-800">{familySummary.fullSiblings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Maternal Half-Siblings:</span>
                  <span className="font-bold text-slate-800">{familySummary.maternalHalfSiblings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paternal Half-Siblings:</span>
                  <span className="font-bold text-slate-800">{familySummary.paternalHalfSiblings.length}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1 font-semibold">
                  <span className="text-emerald-800">Direct Offspring (Children):</span>
                  <span className="font-bold text-emerald-800">{familySummary.children.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Breeding & Hatching Output */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Breeding & Productivity Output
          </h3>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block">Rounds Participated</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {hatchingStats?.totalRounds || 0}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block">Eggs Laid</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {hatchingStats?.totalEggs || 0}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block">Babies Hatched</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {hatchingStats?.totalHatched || 0}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block">Hatching Success</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {hatchingStats?.hatchingRate || 0}%
                </span>
              </div>
            </div>

            {pigeon.firstFlyingDate && (
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex justify-between">
                <span className="text-slate-500">First Flight Date:</span>
                <span className="font-mono font-semibold">{formatDate(pigeon.firstFlyingDate)}</span>
              </div>
            )}

            {flyingRecords.length > 0 && (
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex justify-between">
                <span className="text-slate-500">Official Flight Logs:</span>
                <span className="font-mono font-semibold">{flyingRecords.length} recorded</span>
              </div>
            )}

            {healthRecords.length > 0 && (
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex justify-between">
                <span className="text-slate-500">Health Treatments:</span>
                <span className="font-mono font-semibold text-emerald-700">{healthRecords.length} completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Physical Attributes & Loft Notes */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white mb-6 text-xs space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
          Loft Notes & Distinctive Markings
        </span>
        <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">
          {pigeon.notes || "Standard physical characteristics and healthy loft condition."}
        </p>
      </div>

      {/* Certificate Footer & Official Endorsement */}
      <div className="border-t-2 border-emerald-800 pt-4 flex items-end justify-between text-xs">
        <div>
          <p className="font-bold text-emerald-900 text-xs uppercase">
            {SITE_CONFIG.farmName} Loft Certification
          </p>
          <p className="text-[10px] text-slate-500">
            Certified biological pedigree and official record maintained in Himel Agro ERP system.
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            Location: {SITE_CONFIG.location} • WhatsApp: {SITE_CONFIG.whatsappNumber}
          </p>
        </div>

        <div className="text-center">
          <div className="w-36 border-b border-slate-400 mb-1" />
          <span className="text-[10px] uppercase font-bold text-slate-600 block">
            Authorized Loft Master
          </span>
          <span className="text-[9px] text-slate-400 font-medium">Himel Agro Pedigree Seal</span>
        </div>
      </div>
    </div>
  );
}
