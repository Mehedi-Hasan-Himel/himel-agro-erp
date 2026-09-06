"use client";

import React from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { Pair } from "@/types/breeding";
import { StatusBadge } from "./StatusBadge";
import { SexBadge } from "./SexBadge";
import { formatDate, calculateAge } from "@/lib/formatters/dateFormatter";
import { formatRingNumber, formatCompactRing } from "@/lib/formatters/ringFormatter";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import {
  ArrowRight,
  Calendar,
  Layers,
  ShieldCheck,
  Tag,
  GitFork,
  Heart,
  Plane,
  Sparkles,
  Info,
} from "lucide-react";
import {
  CockPigeonIcon,
  HenPigeonIcon,
  SquabIcon,
  PigeonIcon,
  TakaIcon,
} from "@/components/ui/icons";

export interface PigeonCardProps {
  pigeon: Pigeon;
  allPigeons?: Pigeon[];
  pairs?: Pair[];
  fatherRing?: string;
  motherRing?: string;
}

export function PigeonCard({
  pigeon,
  allPigeons = [],
  pairs = [],
  fatherRing,
  motherRing,
}: PigeonCardProps) {
  const age = calculateAge(pigeon.birthDate || pigeon.hatchDate);
  const ringFormatted = formatRingNumber(pigeon);
  const compactRing = formatCompactRing(pigeon);

  // Resolve biological father & mother from allPigeons if provided
  const father = pigeon.fatherId
    ? allPigeons.find((p) => p.id === pigeon.fatherId) || null
    : null;
  const mother = pigeon.motherId
    ? allPigeons.find((p) => p.id === pigeon.motherId) || null
    : null;

  // Resolve active breeding pair if paired
  const activePair = React.useMemo(() => {
    if (!pairs || pairs.length === 0) return null;
    return (
      pairs.find(
        (pr) =>
          pr.status === "ACTIVE" &&
          (pr.maleId === pigeon.id || pr.femaleId === pigeon.id)
      ) || null
    );
  }, [pairs, pigeon.id]);

  const photoCount = pigeon.photos?.length || (pigeon.photoUrl ? 1 : 0);
  const videoCount = pigeon.videos?.length || 0;

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/85 hover:border-emerald-400/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* 1. Hero Media Showcase */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/40 border-b border-slate-100">
        {pigeon.photoUrl ? (
          <img
            src={pigeon.photoUrl}
            alt={pigeon.id}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-emerald-100 flex items-center justify-center text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform">
              {pigeon.sex === "MALE" ? (
                <CockPigeonIcon className="w-8 h-8 text-sky-700" />
              ) : pigeon.sex === "FEMALE" ? (
                <HenPigeonIcon className="w-8 h-8 text-pink-700" />
              ) : (
                <SquabIcon className="w-8 h-8 text-emerald-700" />
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {pigeon.breedSubtype || pigeon.breed}
            </span>
          </div>
        )}

        {/* Gradient shadow for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35 pointer-events-none" />

        {/* Top Badges Bar (Floating) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 z-10">
          <div className="flex items-center gap-1.5">
            {/* Dynamic Unique ID */}
            <span className="font-mono font-black text-xs tracking-tight text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 shadow-xs">
              {pigeon.id}
            </span>
            <SexBadge sex={pigeon.sex} />
          </div>

          <div className="flex items-center gap-1.5">
            <StatusBadge status={pigeon.status} size="sm" />
            {pigeon.status === "ACTIVE" && pigeon.isForSale && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-black border border-emerald-400/40 shadow-xs">
                <Tag className="w-3 h-3 text-emerald-200" />
                {pigeon.askingPrice ? formatCurrency(pigeon.askingPrice) : "For Sale"}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Floating Bar on Photo */}
        <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between z-10">
          {/* Pair Status Pill */}
          {activePair ? (
            <Link
              href={`/breeding/pairs/${activePair.id}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold border border-rose-300/40 shadow-xs hover:bg-rose-600 transition-colors"
              title={`Paired in Cage ${activePair.cageNumber || "N/A"}`}
            >
              <Heart className="w-2.5 h-2.5 fill-white" />
              <span>Paired {activePair.cageNumber ? `(${activePair.cageNumber})` : ""}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-md text-slate-200 text-[10px] font-medium border border-white/10">
              <PigeonIcon className="w-2.5 h-2.5 text-slate-300" />
              <span>Single</span>
            </span>
          )}

          {/* Media Count Counters */}
          {(photoCount > 0 || videoCount > 0) && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border border-white/15">
              {photoCount > 0 && <span>📷 {photoCount}</span>}
              {videoCount > 0 && <span>🎥 {videoCount}</span>}
            </div>
          )}
        </div>
      </div>

      {/* 2. Breed, Ring & Identification Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/40">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors truncate">
            {pigeon.breedSubtype || pigeon.breed}
          </h3>
          <span className="text-[11px] font-mono font-semibold text-slate-400 shrink-0">
            {pigeon.ringYear} Ring
          </span>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
          <span>{pigeon.breed}</span>
          {pigeon.breedSubtype && pigeon.breedSubtype !== pigeon.breed && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">{pigeon.breedSubtype}</span>
            </>
          )}
        </p>

        {/* Reformed Ring Number Badge (Green bg, White text, wraps cleanly without clipping) */}
        <div className="mt-3">
          <div className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-3 py-1 rounded-xl bg-emerald-600 text-white font-mono text-[11px] font-bold shadow-xs border border-emerald-700 leading-normal">
            <span>{pigeon.ringYear}</span>
            <span className="text-emerald-300 text-[10px]">|</span>
            <span className="text-emerald-100 font-extrabold">
              {pigeon.ringSerial.toString().padStart(2, "0")}
            </span>
            <span className="text-emerald-300 text-[10px]">|</span>
            <span>{pigeon.farmName || "Himel Agro"}</span>
            <span className="text-emerald-300 text-[10px]">|</span>
            <span className="tracking-tighter">{pigeon.contactNumber || "01560059954"}</span>
          </div>
        </div>
      </div>

      {/* 3. Card Body: Organic Specs & Lineage */}
      <div className="p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
        {/* Metric Spec Cards */}
        <div className="grid grid-cols-2 gap-2 text-slate-600">
          {/* Hatch Date & Age */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" /> Hatch / Age
            </span>
            <div className="mt-1">
              <span className="font-mono font-bold text-slate-800 block text-xs truncate">
                {formatDate(pigeon.birthDate || pigeon.hatchDate)}
              </span>
              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                {age}
              </span>
            </div>
          </div>

          {/* Clutch / Origin */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400 shrink-0" /> Clutch / Line
            </span>
            <div className="mt-1">
              <span className="font-mono font-bold text-slate-800 block text-xs truncate">
                {pigeon.clutchId || "Batch N/A"}
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate block mt-0.5">
                {pigeon.source === "BORN_HIMEL_AGRO" ? "Himel Agro Bred" : "Purchased"}
              </span>
            </div>
          </div>
        </div>

        {/* Biological Parentage (Sire & Dam) */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3 text-slate-400" /> Biological Parents
            </span>
            <Link
              href={`/pigeons/${pigeon.id}/pedigree`}
              className="text-emerald-700 hover:text-emerald-800 hover:underline normal-case font-semibold"
            >
              Pedigree &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Sire (Father) */}
            <div className="p-2 rounded-xl bg-sky-50/80 border border-sky-200/80 hover:bg-sky-100/70 transition-colors">
              <span className="text-[9px] font-bold text-sky-800 uppercase flex items-center gap-1 mb-0.5">
                <CockPigeonIcon className="w-3 h-3 text-sky-700 shrink-0" /> Sire (Father)
              </span>
              {father ? (
                <Link
                  href={`/pigeons/${father.id}`}
                  className="font-mono font-bold text-sky-950 hover:underline block truncate"
                  title={`${father.id}: ${formatRingNumber(father)}`}
                >
                  {father.id}
                  <span className="text-[10px] font-normal text-sky-700 block truncate">
                    {father.breedSubtype || formatCompactRing(father)}
                  </span>
                </Link>
              ) : pigeon.fatherId ? (
                <Link
                  href={`/pigeons/${pigeon.fatherId}`}
                  className="font-mono font-bold text-sky-950 hover:underline block truncate"
                >
                  {fatherRing || pigeon.fatherId}
                </Link>
              ) : (
                <span className="text-slate-400 italic text-[10px] block">Unregistered</span>
              )}
            </div>

            {/* Dam (Mother) */}
            <div className="p-2 rounded-xl bg-pink-50/80 border border-pink-200/80 hover:bg-pink-100/70 transition-colors">
              <span className="text-[9px] font-bold text-pink-800 uppercase flex items-center gap-1 mb-0.5">
                <HenPigeonIcon className="w-3 h-3 text-pink-700 shrink-0" /> Dam (Mother)
              </span>
              {mother ? (
                <Link
                  href={`/pigeons/${mother.id}`}
                  className="font-mono font-bold text-pink-950 hover:underline block truncate"
                  title={`${mother.id}: ${formatRingNumber(mother)}`}
                >
                  {mother.id}
                  <span className="text-[10px] font-normal text-pink-700 block truncate">
                    {mother.breedSubtype || formatCompactRing(mother)}
                  </span>
                </Link>
              ) : pigeon.motherId ? (
                <Link
                  href={`/pigeons/${pigeon.motherId}`}
                  className="font-mono font-bold text-pink-950 hover:underline block truncate"
                >
                  {motherRing || pigeon.motherId}
                </Link>
              ) : (
                <span className="text-slate-400 italic text-[10px] block">Unregistered</span>
              )}
            </div>
          </div>
        </div>

        {/* Flight & Commercial Footnotes */}
        {pigeon.firstFlyingDate && (
          <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-center justify-between">
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <Plane className="w-3 h-3" /> First Flight:
            </span>
            <span className="font-mono font-bold">{formatDate(pigeon.firstFlyingDate)}</span>
          </div>
        )}

        {pigeon.source === "PURCHASED" && pigeon.seller && (
          <div className="p-2 rounded-xl bg-slate-100/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="text-slate-500">Purchased from:</span>
            <span className="font-semibold text-slate-800 truncate max-w-[140px]">
              {pigeon.seller}
            </span>
          </div>
        )}

        {pigeon.status === "SOLD" && (
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
            <span className="font-semibold">Sold To:</span>
            <span className="font-bold text-blue-700 truncate max-w-[140px]">
              {pigeon.buyer || "Buyer"}
            </span>
          </div>
        )}
      </div>

      {/* 4. Card Action Footer */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[110px] sm:max-w-[140px]" title={compactRing}>
            {compactRing}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={`/pigeons/${pigeon.id}/pedigree`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors"
            title="View Pedigree Tree"
          >
            <GitFork className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Tree</span>
          </Link>

          <Link
            href={`/pigeons/${pigeon.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PigeonCard;
