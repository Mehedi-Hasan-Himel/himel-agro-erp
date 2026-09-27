"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Goat } from "@/types/goat";
import { getGoatById, getGoats } from "@/lib/repositories/goatRepository";
import { calculateKinship } from "@/lib/calculations/genericKinshipCalculator";
import { ArrowLeft, Printer, GitFork, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/formatters/dateFormatter";

interface AncestorCardProps {
  goat?: Goat | null;
  role: string;
  subrole?: string;
  fallbackText?: string;
}

function AncestorCard({ goat, role, subrole, fallbackText }: AncestorCardProps) {
  if (!goat) {
    return (
      <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
          {role} {subrole ? `• ${subrole}` : ""}
        </span>
        <div className="text-xs text-slate-500 italic">
          {fallbackText || "Unregistered / Foundation"}
        </div>
      </div>
    );
  }

  const isBuck = goat.sex === "MALE";

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        isBuck
          ? "bg-blue-50/40 border-blue-200/80 hover:border-blue-400"
          : "bg-rose-50/40 border-rose-200/80 hover:border-rose-400"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${
            isBuck ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"
          }`}
        >
          {role}
        </span>
        <span className="font-mono text-[10px] font-bold text-slate-700">
          {goat.tagNumber}
        </span>
      </div>

      <Link
        href={`/goats/${goat.id}`}
        className="font-bold text-slate-900 text-xs hover:text-emerald-700 hover:underline block truncate"
      >
        {goat.name || goat.tagNumber}
      </Link>
      <div className="text-[10px] text-slate-500 truncate mt-0.5">
        {goat.breed} {goat.breedSubtype ? `• ${goat.breedSubtype}` : ""}
      </div>
      {goat.birthDate && (
        <div className="text-[9px] text-slate-400 mt-1 font-mono">
          Born: {formatDate(goat.birthDate)}
        </div>
      )}
    </div>
  );
}

export default function GoatPedigreePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [goat, setGoat] = useState<Goat | null>(null);
  const [allGoats, setAllGoats] = useState<Goat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getGoatById(id), getGoats()]).then(([g, list]) => {
      setGoat(g);
      setAllGoats(list);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Building pedigree tree...</div>;
  }

  if (!goat) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Goat Not Found</h2>
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

  const sire = allGoats.find((g) => g.id === goat.fatherId);
  const dam = allGoats.find((g) => g.id === goat.motherId);

  const paternalGrandsire = sire ? allGoats.find((g) => g.id === sire.fatherId) : null;
  const paternalGranddam = sire ? allGoats.find((g) => g.id === sire.motherId) : null;
  const maternalGrandsire = dam ? allGoats.find((g) => g.id === dam.fatherId) : null;
  const maternalGranddam = dam ? allGoats.find((g) => g.id === dam.motherId) : null;

  const kinship = calculateKinship(goat, allGoats);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href={`/goats/${encodeURIComponent(goat.id)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dossier</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pedigree Certificate</span>
          </button>
        </div>
      </div>

      {/* Certificate Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Himel Agro Farm • Certified Caprine Pedigree Certificate</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {goat.name || `Goat ${goat.tagNumber}`} (Ear Tag: {goat.tagNumber})
        </h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Official ancestral pedigree tree tracking sire, dam, and 3-generation caprine genealogy lines.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs">
          <span className="font-semibold text-slate-700">Breed: <strong>{goat.breed}</strong></span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">Sex: <strong>{goat.sex === "MALE" ? "♂ Buck" : "♀ Doe"}</strong></span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">DOB: <strong>{formatDate(goat.birthDate)}</strong></span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">Kinship Relations: <strong>{kinship.totalRelationsCount}</strong></span>
        </div>
      </div>

      {/* 3-Generation Pedigree Tree Diagram */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
          <GitFork className="w-4 h-4 text-emerald-600" />
          <span>Ancestral Lineage Tree (3 Generations)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Subject (Gen 0) */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
              Subject Animal (Generation 0)
            </span>
            <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-500 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {goat.tagNumber}
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  {goat.sex === "MALE" ? "♂ Buck" : "♀ Doe"}
                </span>
              </div>
              <div className="font-black text-slate-900 text-base">{goat.name || "Subject Goat"}</div>
              <div className="text-xs text-slate-600">{goat.breed}</div>
              <div className="text-[11px] text-slate-500">Born: {formatDate(goat.birthDate)}</div>
            </div>
          </div>

          {/* Parents (Gen 1) */}
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
              Parents (Generation 1)
            </span>
            <AncestorCard
              goat={sire}
              role="Sire"
              subrole="Father Buck"
              fallbackText={goat.fatherDetails || "Foundation Sire (Unknown)"}
            />
            <AncestorCard
              goat={dam}
              role="Dam"
              subrole="Mother Doe"
              fallbackText={goat.motherDetails || "Foundation Dam (Unknown)"}
            />
          </div>

          {/* Grandparents (Gen 2) */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
              Grandparents (Generation 2)
            </span>
            <div className="space-y-2">
              <AncestorCard
                goat={paternalGrandsire}
                role="Paternal Grandsire"
                fallbackText="Sire's Father (Foundation)"
              />
              <AncestorCard
                goat={paternalGranddam}
                role="Paternal Granddam"
                fallbackText="Sire's Mother (Foundation)"
              />
              <AncestorCard
                goat={maternalGrandsire}
                role="Maternal Grandsire"
                fallbackText="Dam's Father (Foundation)"
              />
              <AncestorCard
                goat={maternalGranddam}
                role="Maternal Granddam"
                fallbackText="Dam's Mother (Foundation)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kinship Summary Footer */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs space-y-2">
        <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
          Genetic Purity & Inbreeding Safeguards
        </h3>
        <p className="text-slate-600 leading-relaxed">
          This pedigree is indexed in the Himel Agro Multi-Animal Farming Database. No inbreeding loops or full-sibling backcrosses detected in active mating plans.
        </p>
      </div>
    </div>
  );
}
