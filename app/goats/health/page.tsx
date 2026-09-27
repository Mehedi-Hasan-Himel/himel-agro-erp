"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GoatHealthRecord } from "@/types/goat";
import { getGoatHealthRecords } from "@/lib/repositories/goatRepository";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { Activity, ShieldCheck, ArrowLeft, Calendar, Syringe, PlusCircle, AlertCircle } from "lucide-react";

export default function GoatHealthPage() {
  const [records, setRecords] = useState<GoatHealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGoatHealthRecords().then((recs) => {
      setRecords(recs);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Goat Health, Vaccines & Deworming
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              PPR & Deworming Protocols
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immunization schedule, preventive anthelmintic courses, booster dates, and veterinary logs.
          </p>
        </div>

        <Link
          href="/goats"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Herd Registry</span>
        </Link>
      </div>

      {/* Recommended Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700 text-base">💉</span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">PPR Vaccine</h3>
              <span className="text-[10px] text-purple-700 font-semibold">Annual Immunization</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Essential live-attenuated vaccine against Peste des Petits Ruminants (Goat Plague). 1 ml SC once a year.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 text-base">💊</span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Deworming Protocol</h3>
              <span className="text-[10px] text-teal-700 font-semibold">Quarterly Cycle (Every 90d)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Broad-spectrum parasite control (Ivermectin/Albendazole) alternating before and after monsoon seasons.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 text-base">🛡️</span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Enterotoxaemia (ET)</h3>
              <span className="text-[10px] text-amber-700 font-semibold">Pre-Monsoon Vaccination</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Prevents pulpy kidney disease during changes to rich green fodder (Napier grass or lush grazing).
          </p>
        </div>
      </div>

      {/* Health Records Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recorded Health & Vaccination Interventions ({records.length} Records)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Target Animal</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Treatment / Vaccine Name</th>
                <th className="py-3 px-4">Dosage / Details</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Administered By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading health records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No health records logged yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {r.targetTagNumber || "Herd"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {r.treatmentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {r.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {r.dosage} {r.notes ? `• ${r.notes}` : ""}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold whitespace-nowrap">
                      {r.nextDueDate ? formatDate(r.nextDueDate) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {r.administeredBy || "Farm Staff"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
