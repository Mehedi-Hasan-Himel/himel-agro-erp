"use client";

import React from "react";
import Link from "next/link";
import { PedigreeNodeData } from "@/types/pedigree";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { StatusBadge } from "../pigeons/StatusBadge";
import { ArrowRight, Trophy, Sparkles } from "lucide-react";

export interface PedigreeNodeProps {
  node: PedigreeNodeData;
  isRoot?: boolean;
}

export function PedigreeNode({ node, isRoot = false }: PedigreeNodeProps) {
  const pigeon = node.pigeon;

  if (!pigeon) {
    return (
      <div className="w-56 p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center flex flex-col items-center justify-center min-h-[100px] shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
          {node.relation}
        </span>
        <span className="text-xs font-semibold text-slate-400">
          Unknown Ancestor
        </span>
        <span className="text-[10px] text-slate-400 mt-1">
          (Outside / Unregistered)
        </span>
      </div>
    );
  }

  const isMale = pigeon.sex === "MALE";
  const isFemale = pigeon.sex === "FEMALE";

  return (
    <div
      className={`w-64 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        isRoot
          ? "bg-linear-to-b from-emerald-50/80 to-white border-emerald-300 ring-2 ring-emerald-500/20"
          : isMale
          ? "bg-linear-to-b from-sky-50/60 to-white border-sky-200 hover:border-sky-300"
          : isFemale
          ? "bg-linear-to-b from-pink-50/60 to-white border-pink-200 hover:border-pink-300"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Node Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isMale ? "bg-sky-500" : isFemale ? "bg-pink-500" : "bg-slate-400"
            }`}
          />
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            {node.relation}
          </span>
        </div>
        <StatusBadge status={pigeon.status} size="sm" />
      </div>

      {/* Node Details */}
      <div className="p-3.5 space-y-2 text-xs">
        <div>
          <div className="font-mono font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>{formatCompactRing(pigeon)}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                isMale
                  ? "bg-sky-100 text-sky-800"
                  : isFemale
                  ? "bg-pink-100 text-pink-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isMale ? "Cock ♂" : isFemale ? "Hen ♀" : "Baby"}
            </span>
          </div>
          <p className="font-semibold text-slate-700 text-xs mt-0.5 truncate">
            {pigeon.breedSubtype || pigeon.breed}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Hatch: {formatDate(pigeon.hatchDate)}</span>
          <span>Gen {node.generation}</span>
        </div>

        {/* Best flying or breeding performance indicator if present */}
        {node.bestFlyingRecord && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-1.5 text-[10px] text-amber-900 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">
              {node.bestFlyingRecord.flightDurationMinutes
                ? `${Math.floor(node.bestFlyingRecord.flightDurationMinutes / 60)}h ${node.bestFlyingRecord.flightDurationMinutes % 60}m flight`
                : node.bestFlyingRecord.result || "Flight Record"}
            </span>
          </div>
        )}

        {/* View Profile Link */}
        <div className="pt-2 flex items-center justify-end">
          <Link
            href={`/pigeons/${pigeon.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            View Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
