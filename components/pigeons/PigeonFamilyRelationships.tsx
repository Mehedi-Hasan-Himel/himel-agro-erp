"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import {
  calculateFamilyRelationships,
  RelatedPigeon,
  FamilyTreeSummary,
} from "@/lib/calculations/relationshipCalculator";
import { formatRingNumber, formatCompactRing } from "@/lib/formatters/ringFormatter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SexBadge } from "@/components/pigeons/SexBadge";
import { StatusBadge } from "@/components/pigeons/StatusBadge";
import {
  GitFork,
  Users,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Crown,
} from "lucide-react";
import { CockPigeonIcon, HenPigeonIcon, SquabIcon } from "@/components/ui/icons";

export interface PigeonFamilyRelationshipsProps {
  pigeon: Pigeon;
  allPigeons: Pigeon[];
}

export function PigeonFamilyRelationships({
  pigeon,
  allPigeons,
}: PigeonFamilyRelationshipsProps) {
  const familySummary: FamilyTreeSummary = useMemo(() => {
    return calculateFamilyRelationships(pigeon, allPigeons);
  }, [pigeon, allPigeons]);

  const {
    father,
    mother,
    twinSiblings,
    fullSiblings,
    maternalHalfSiblings,
    paternalHalfSiblings,
    children,
    grandchildren,
    grandparents,
    unclesAndAunts,
    nephewsAndNieces,
    cousins,
    totalRelationsCount,
  } = familySummary;

  const renderRelativeCard = (item: RelatedPigeon, badgeColor: string) => {
    const rel = item.pigeon;

    return (
      <Link
        key={rel.id}
        href={`/pigeons/${rel.id}`}
        className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all text-xs"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-1.5">
            <span
              className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor}`}
            >
              {item.relationship}
            </span>
            <div className="flex items-center gap-1">
              <SexBadge sex={rel.sex} />
              <StatusBadge status={rel.status} size="sm" />
            </div>
          </div>

          <div>
            <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors block truncate">
              {formatCompactRing(rel)}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {rel.breedSubtype || rel.breed} ({rel.ringYear})
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500">
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDate(rel.birthDate || rel.hatchDate)}
            </span>
            {rel.clutchId && (
              <span className="flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                <Layers className="w-2.5 h-2.5 text-slate-400" />
                {rel.clutchId}
              </span>
            )}
          </div>
        </div>

        {item.details && (
          <p className="mt-2 text-[10px] text-slate-400 italic line-clamp-1">
            {item.details}
          </p>
        )}
      </Link>
    );
  };

  return (
    <Card className="border-slate-200/90 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50/70 via-slate-50 to-emerald-50/30 border-b border-slate-200/80 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Family & Relationships
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {totalRelationsCount} Verified Kin
                </span>
              </CardTitle>
              <p className="text-xs text-slate-600">
                Authoritative biological parentage tracking and automatic kinship calculations for {pigeon.id}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Auto-Calculated
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Section 1: Biological Parents (Sire & Dam) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              1. Authoritative Biological Parents (Sire & Dam)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Father */}
            <div className="p-4 rounded-2xl border bg-gradient-to-br from-sky-50/60 to-white border-sky-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                  <CockPigeonIcon className="w-4 h-4 text-sky-700" />
                  <span>Biological Father (Sire)</span>
                </span>
                {father && <StatusBadge status={father.status} size="sm" />}
              </div>

              {father ? (
                <div className="space-y-1">
                  <Link
                    href={`/pigeons/${father.id}`}
                    className="font-mono font-bold text-base text-sky-950 hover:text-sky-700 hover:underline block"
                  >
                    {formatCompactRing(father)}
                  </Link>
                  <p className="text-xs text-slate-600">
                    {father.breedSubtype || father.breed} • Ring: {formatRingNumber(father)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Hatched: {formatDate(father.birthDate || father.hatchDate)}
                  </p>
                </div>
              ) : (
                <div className="py-2 text-xs text-slate-400 italic">
                  No registered father ID on record.
                </div>
              )}
            </div>

            {/* Mother */}
            <div className="p-4 rounded-2xl border bg-gradient-to-br from-pink-50/60 to-white border-pink-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                  <HenPigeonIcon className="w-4 h-4 text-pink-700" />
                  <span>Biological Mother (Dam)</span>
                </span>
                {mother && <StatusBadge status={mother.status} size="sm" />}
              </div>

              {mother ? (
                <div className="space-y-1">
                  <Link
                    href={`/pigeons/${mother.id}`}
                    className="font-mono font-bold text-base text-pink-950 hover:text-pink-700 hover:underline block"
                  >
                    {formatCompactRing(mother)}
                  </Link>
                  <p className="text-xs text-slate-600">
                    {mother.breedSubtype || mother.breed} • Ring: {formatRingNumber(mother)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Hatched: {formatDate(mother.birthDate || mother.hatchDate)}
                  </p>
                </div>
              ) : (
                <div className="py-2 text-xs text-slate-400 italic">
                  No registered mother ID on record.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Twin Siblings */}
        {twinSiblings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Twin Siblings ({twinSiblings.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Same Father + Same Mother + Same Birth Date / Clutch
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {twinSiblings.map((item) =>
                renderRelativeCard(item, "bg-amber-100 text-amber-900 border border-amber-300")
              )}
            </div>
          </div>
        )}

        {/* Section 3: Full Siblings */}
        {fullSiblings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Full Siblings ({fullSiblings.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Same Father + Same Mother (Different Clutch / Birth Date)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fullSiblings.map((item) =>
                renderRelativeCard(item, "bg-emerald-100 text-emerald-900 border border-emerald-300")
              )}
            </div>
          </div>
        )}

        {/* Section 4: Maternal Half-Siblings */}
        {maternalHalfSiblings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                <HenPigeonIcon className="w-3.5 h-3.5 text-purple-600" />
                Maternal Half-Siblings ({maternalHalfSiblings.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Same Mother ({pigeon.motherId || "Dam"}), Different Father
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {maternalHalfSiblings.map((item) =>
                renderRelativeCard(item, "bg-purple-100 text-purple-900 border border-purple-300")
              )}
            </div>
          </div>
        )}

        {/* Section 5: Paternal Half-Siblings */}
        {paternalHalfSiblings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                <CockPigeonIcon className="w-3.5 h-3.5 text-indigo-600" />
                Paternal Half-Siblings ({paternalHalfSiblings.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Same Father ({pigeon.fatherId || "Sire"}), Different Mother
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paternalHalfSiblings.map((item) =>
                renderRelativeCard(item, "bg-indigo-100 text-indigo-900 border border-indigo-300")
              )}
            </div>
          </div>
        )}

        {/* If no siblings recorded */}
        {twinSiblings.length === 0 &&
          fullSiblings.length === 0 &&
          maternalHalfSiblings.length === 0 &&
          paternalHalfSiblings.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500">
              No brothers or sisters (twin, full, or half) registered in the system yet.
            </div>
          )}

        {/* Section 6: Children (Direct Offspring) */}
        {children.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <SquabIcon className="w-3.5 h-3.5 text-teal-600" />
                Direct Offspring / Children ({children.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Next-generation descendants of this pigeon
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {children.map((item) =>
                renderRelativeCard(item, "bg-teal-100 text-teal-900 border border-teal-300")
              )}
            </div>
          </div>
        )}

        {/* Extended Family Members (Grandparents, Grandchildren, Uncles/Aunts, Nephews, Cousins) */}
        {(grandparents.length > 0 ||
          grandchildren.length > 0 ||
          unclesAndAunts.length > 0 ||
          nephewsAndNieces.length > 0 ||
          cousins.length > 0) && (
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-slate-600" />
              Extended Bloodline Relatives
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grandparents */}
              {grandparents.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Grandparents ({grandparents.length})
                  </span>
                  <div className="space-y-2">
                    {grandparents.map((gp) => (
                      <div
                        key={gp.pigeon.id}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            {gp.relationship}
                          </span>
                          <Link
                            href={`/pigeons/${gp.pigeon.id}`}
                            className="font-mono font-bold text-emerald-800 hover:underline"
                          >
                            {formatCompactRing(gp.pigeon)}
                          </Link>
                        </div>
                        <SexBadge sex={gp.pigeon.sex} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grandchildren */}
              {grandchildren.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Grandchildren ({grandchildren.length})
                  </span>
                  <div className="space-y-2">
                    {grandchildren.map((gc) => (
                      <div
                        key={gc.pigeon.id}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            {gc.relationship}
                          </span>
                          <Link
                            href={`/pigeons/${gc.pigeon.id}`}
                            className="font-mono font-bold text-emerald-800 hover:underline"
                          >
                            {formatCompactRing(gc.pigeon)}
                          </Link>
                        </div>
                        <SexBadge sex={gc.pigeon.sex} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uncles & Aunts */}
              {unclesAndAunts.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Uncles & Aunts ({unclesAndAunts.length})
                  </span>
                  <div className="space-y-2">
                    {unclesAndAunts.map((ua) => (
                      <div
                        key={ua.pigeon.id}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            {ua.relationship}
                          </span>
                          <Link
                            href={`/pigeons/${ua.pigeon.id}`}
                            className="font-mono font-bold text-emerald-800 hover:underline"
                          >
                            {formatCompactRing(ua.pigeon)}
                          </Link>
                        </div>
                        <SexBadge sex={ua.pigeon.sex} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nephews & Nieces */}
              {nephewsAndNieces.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Nephews & Nieces ({nephewsAndNieces.length})
                  </span>
                  <div className="space-y-2">
                    {nephewsAndNieces.map((nn) => (
                      <div
                        key={nn.pigeon.id}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            {nn.relationship}
                          </span>
                          <Link
                            href={`/pigeons/${nn.pigeon.id}`}
                            className="font-mono font-bold text-emerald-800 hover:underline"
                          >
                            {formatCompactRing(nn.pigeon)}
                          </Link>
                        </div>
                        <SexBadge sex={nn.pigeon.sex} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cousins */}
              {cousins.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 md:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    First Cousins ({cousins.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {cousins.map((cs) => (
                      <div
                        key={cs.pigeon.id}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            {cs.relationship}
                          </span>
                          <Link
                            href={`/pigeons/${cs.pigeon.id}`}
                            className="font-mono font-bold text-emerald-800 hover:underline"
                          >
                            {formatCompactRing(cs.pigeon)}
                          </Link>
                        </div>
                        <SexBadge sex={cs.pigeon.sex} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Educational Relationship Rules Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Biological Relationship Calculation Rules:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
            <li>
              <strong>Twin Brother / Sister:</strong> Same fatherId + same motherId AND same birth date / clutch.
            </li>
            <li>
              <strong>Full Brother / Sister:</strong> Same fatherId + same motherId with different birth date / clutch.
            </li>
            <li>
              <strong>Maternal Half-Brother / Sister:</strong> Same motherId but different / new fatherId.
            </li>
            <li>
              <strong>Paternal Half-Brother / Sister:</strong> Same fatherId but different / new motherId.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
