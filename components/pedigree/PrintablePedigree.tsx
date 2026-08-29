"use client";

import React from "react";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import { PedigreeNodeData } from "@/types/pedigree";
import { formatRingNumber, formatCompactRing } from "@/lib/formatters/ringFormatter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { Award, ShieldCheck } from "lucide-react";

export interface PrintablePedigreeProps {
  tree: PedigreeNodeData;
  id?: string;
}

export function PrintablePedigree({ tree, id = "pedigree-certificate" }: PrintablePedigreeProps) {
  const subject = tree.pigeon;
  if (!subject) return null;

  const father = tree.father?.pigeon;
  const mother = tree.mother?.pigeon;

  const ff = tree.father?.father?.pigeon;
  const fm = tree.father?.mother?.pigeon;

  const mf = tree.mother?.father?.pigeon;
  const mm = tree.mother?.mother?.pigeon;

  return (
    <div
      id={id}
      className="w-full max-w-[1000px] mx-auto bg-white p-8 sm:p-10 border-4 border-double border-emerald-800 rounded-xl shadow-lg print:border-2 print:shadow-none text-slate-800 font-sans"
    >
      {/* Certificate Header */}
      <div className="border-b-2 border-emerald-700 pb-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Radiant Green Light Glowing Seal Logo Container */}
          <div className="relative w-16 h-16 rounded-full bg-emerald-50 ring-2 ring-emerald-600 shadow-md shadow-emerald-700/30 flex items-center justify-center shrink-0 overflow-hidden">
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
            <p className="text-[11px] text-slate-500">
              Official Bloodline & Pedigree Certificate
            </p>
          </div>
        </div>

        <div className="text-right text-xs space-y-1">
          <div className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Certified Record
          </div>
          <p className="text-slate-600 font-mono text-[11px] font-semibold">
            Contact / WhatsApp: {SITE_CONFIG.contactNumber}
          </p>
        </div>
      </div>

      {/* Subject Pigeon Identity Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 border-b border-slate-700 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
              Ring Identity Number
            </span>
            <h2 className="text-lg sm:text-xl font-mono font-bold text-emerald-300">
              {formatRingNumber(subject)}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
              Internal ID
            </span>
            <span className="font-mono text-sm font-semibold">{subject.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">
              Breed & Subtype
            </span>
            <span className="font-bold text-white text-sm">
              {subject.breedSubtype || subject.breed}
            </span>
            <span className="text-[11px] text-slate-300 block">
              ({subject.breed})
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">
              Sex / Gender
            </span>
            <span className="font-bold text-white text-sm">
              {subject.sex === "MALE"
                ? "Cock (Male ♂)"
                : subject.sex === "FEMALE"
                ? "Hen (Female ♀)"
                : "Squab / Unknown"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">
              Hatch Date
            </span>
            <span className="font-bold text-white text-sm">
              {formatDate(subject.hatchDate)}
            </span>
            <span className="text-[11px] text-slate-300 block">
              Hatch Year: {subject.ringYear}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">
              Source / Origin
            </span>
            <span className="font-bold text-white text-sm">
              {subject.source === "BORN_HIMEL_AGRO"
                ? "Born at Himel Agro"
                : "Purchased"}
            </span>
            {subject.seller && (
              <span className="text-[10px] text-slate-300 truncate block">
                Loft: {subject.seller}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3-Generation Lineage Diagram Grid */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-700" /> Three-Generation Lineage Tree
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Sire (Father Side) */}
          <div className="border border-sky-200 rounded-xl overflow-hidden bg-sky-50/30">
            <div className="bg-sky-700 text-white font-bold px-3.5 py-1.5 text-xs flex justify-between">
              <span>SIRE (FATHER)</span>
              <span>{father ? formatCompactRing(father) : "UNKNOWN"}</span>
            </div>
            <div className="p-3 bg-white space-y-1">
              {father ? (
                <>
                  <p className="font-mono font-bold text-slate-800 text-xs">
                    {formatRingNumber(father)}
                  </p>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    {father.breedSubtype || father.breed} ({father.ringYear})
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {father.notes || "High pedigree breeding cock."}
                  </p>
                </>
              ) : (
                <p className="text-slate-400 italic text-[11px]">
                  Unregistered / Outside Sire
                </p>
              )}
            </div>

            {/* Paternal Grandparents */}
            <div className="grid grid-cols-2 border-t border-sky-200 text-[11px] divide-x divide-sky-200">
              <div className="p-2.5 bg-sky-50/60">
                <span className="text-[9px] font-bold uppercase text-sky-800 block">
                  Father&apos;s Father (P-Gr-Sire)
                </span>
                {ff ? (
                  <>
                    <span className="font-mono font-bold block text-slate-900">
                      {formatCompactRing(ff)}
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      {ff.breedSubtype || ff.breed}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 italic text-[10px]">Unknown</span>
                )}
              </div>
              <div className="p-2.5 bg-sky-50/60">
                <span className="text-[9px] font-bold uppercase text-sky-800 block">
                  Father&apos;s Mother (P-Gr-Dam)
                </span>
                {fm ? (
                  <>
                    <span className="font-mono font-bold block text-slate-900">
                      {formatCompactRing(fm)}
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      {fm.breedSubtype || fm.breed}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 italic text-[10px]">Unknown</span>
                )}
              </div>
            </div>
          </div>

          {/* Dam (Mother Side) */}
          <div className="border border-pink-200 rounded-xl overflow-hidden bg-pink-50/30">
            <div className="bg-pink-700 text-white font-bold px-3.5 py-1.5 text-xs flex justify-between">
              <span>DAM (MOTHER)</span>
              <span>{mother ? formatCompactRing(mother) : "UNKNOWN"}</span>
            </div>
            <div className="p-3 bg-white space-y-1">
              {mother ? (
                <>
                  <p className="font-mono font-bold text-slate-800 text-xs">
                    {formatRingNumber(mother)}
                  </p>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    {mother.breedSubtype || mother.breed} ({mother.ringYear})
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {mother.notes || "Prime maternal breeding hen."}
                  </p>
                </>
              ) : (
                <p className="text-slate-400 italic text-[11px]">
                  Unregistered / Outside Dam
                </p>
              )}
            </div>

            {/* Maternal Grandparents */}
            <div className="grid grid-cols-2 border-t border-pink-200 text-[11px] divide-x divide-pink-200">
              <div className="p-2.5 bg-pink-50/60">
                <span className="text-[9px] font-bold uppercase text-pink-800 block">
                  Mother&apos;s Father (M-Gr-Sire)
                </span>
                {mf ? (
                  <>
                    <span className="font-mono font-bold block text-slate-900">
                      {formatCompactRing(mf)}
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      {mf.breedSubtype || mf.breed}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 italic text-[10px]">Unknown</span>
                )}
              </div>
              <div className="p-2.5 bg-pink-50/60">
                <span className="text-[9px] font-bold uppercase text-pink-800 block">
                  Mother&apos;s Mother (M-Gr-Dam)
                </span>
                {mm ? (
                  <>
                    <span className="font-mono font-bold block text-slate-900">
                      {formatCompactRing(mm)}
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      {mm.breedSubtype || mm.breed}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 italic text-[10px]">Unknown</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Performance Summary */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs mb-6 space-y-2">
        <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
          Physical Notes & Breeding Description
        </h4>
        <p className="text-slate-600 text-xs leading-relaxed">
          {subject.notes ||
            "Full active member of Himel Agro loft stock. Preserved for bloodline purity, breeding performance, and athletic flight evaluation."}
        </p>
      </div>

      {/* Certificate Footer with Signatures */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div className="space-y-0.5">
          <p className="font-bold text-slate-800">
            {SITE_CONFIG.farmName} • {SITE_CONFIG.shortName}
          </p>
          <p className="text-[10px] text-emerald-700 font-medium">
            FB: {SITE_CONFIG.facebookUrl.replace("https://www.", "").replace("https://", "")} • {SITE_CONFIG.location}
          </p>
          <p className="text-[10px] text-slate-400">
            Generated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="text-center border-t-2 border-slate-400 pt-1 w-48">
          <p className="text-[11px] font-bold text-slate-800">Authorized Signature</p>
          <p className="text-[9px] text-slate-500">{SITE_CONFIG.farmName} Loft Manager</p>
        </div>
      </div>
    </div>
  );
}
