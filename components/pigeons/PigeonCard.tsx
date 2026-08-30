import React from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { RingBadge } from "./RingBadge";
import { StatusBadge } from "./StatusBadge";
import { SexBadge } from "./SexBadge";
import { formatDate, calculateAge } from "@/lib/formatters/dateFormatter";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { ArrowRight, Feather, Calendar } from "lucide-react";

export interface PigeonCardProps {
  pigeon: Pigeon;
  fatherRing?: string;
  motherRing?: string;
  pairRing?: string;
}

export function PigeonCard({
  pigeon,
  fatherRing,
  motherRing,
  pairRing,
}: PigeonCardProps) {
  const age = calculateAge(pigeon.hatchDate);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Card Header Banner */}
      <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between gap-3 mb-2">
          <RingBadge pigeon={pigeon} size="md" />
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={pigeon.status} size="sm" />
            {pigeon.status === "ACTIVE" && pigeon.isForSale && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                <span>{pigeon.askingPrice ? `৳${pigeon.askingPrice}` : "For Sale"}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pigeon.photoUrl && (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img
                src={pigeon.photoUrl}
                alt={pigeon.id}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
              {pigeon.breedSubtype || pigeon.breed}
            </h4>
            <span className="text-xs text-slate-400 font-normal">
              ({pigeon.breed})
            </span>
          </div>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="p-5 space-y-3.5 flex-1 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <SexBadge sex={pigeon.sex} />
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(pigeon.hatchDate)}</span>
            <span className="text-slate-400 text-[10px]">({age})</span>
          </div>
        </div>

        {/* Lineage brief */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="block text-slate-400 uppercase text-[9px] font-semibold">
              Father
            </span>
            {pigeon.fatherId ? (
              <Link
                href={`/pigeons/${pigeon.fatherId}`}
                className="font-medium text-emerald-700 hover:underline truncate block"
              >
                {fatherRing || pigeon.fatherId}
              </Link>
            ) : (
              <span className="text-slate-400">Unknown</span>
            )}
          </div>
          <div>
            <span className="block text-slate-400 uppercase text-[9px] font-semibold">
              Mother
            </span>
            {pigeon.motherId ? (
              <Link
                href={`/pigeons/${pigeon.motherId}`}
                className="font-medium text-emerald-700 hover:underline truncate block"
              >
                {motherRing || pigeon.motherId}
              </Link>
            ) : (
              <span className="text-slate-400">Unknown</span>
            )}
          </div>
        </div>

        {pigeon.source === "PURCHASED" && (
          <div className="text-[11px] bg-slate-50 p-2 rounded-lg text-slate-500">
            <span className="font-semibold text-slate-700">Source:</span> Purchased
            {pigeon.seller && ` from ${pigeon.seller}`}
            {pigeon.purchasePrice ? ` (৳${pigeon.purchasePrice})` : ""}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-400">
          {formatCompactRing(pigeon)}
        </span>
        <Link
          href={`/pigeons/${pigeon.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-md px-1"
        >
          View Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
