"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GoatBreedingRecord, Goat } from "@/types/goat";
import { getGoatBreedingRecords, getGoats } from "@/lib/repositories/goatRepository";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { GitFork, PlusCircle, ArrowLeft, Calendar, Heart, CheckCircle2, Clock } from "lucide-react";

export default function GoatBreedingPage() {
  const [records, setRecords] = useState<GoatBreedingRecord[]>([]);
  const [goats, setGoats] = useState<Goat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGoatBreedingRecords(), getGoats()]).then(([recs, gList]) => {
      setRecords(recs);
      setGoats(gList);
      setIsLoading(false);
    });
  }, []);

  const calculateDaysRemaining = (targetDate: string) => {
    if (!targetDate) return null;
    const due = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Goat Breeding & Reproductive Registry
            </h1>
            <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full">
              ~150 Days Gestation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track natural stud service, pregnancy ultrasounds, expected kidding calendars, and offspring litters.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Confirmed Pregnancies</span>
            <span>💖</span>
          </div>
          <div className="text-2xl font-black text-pink-600">
            {records.filter((r) => r.status === "CONFIRMED_PREGNANT").length}
          </div>
          <span className="text-[11px] text-pink-700 font-medium">Due in maternity pens</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Completed Kidding</span>
            <span>🍼</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {records.filter((r) => r.status === "KIDDING_COMPLETED").length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Healthy litters delivered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Recent Matings</span>
            <span>🐐</span>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {records.filter((r) => r.status === "MATING").length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Under gestation observation</span>
        </div>
      </div>

      {/* Breeding Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Active Mating & Kidding Log ({records.length} Records)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Dam (Doe)</th>
                <th className="py-3 px-4">Sire (Buck)</th>
                <th className="py-3 px-4">Mating Date</th>
                <th className="py-3 px-4">Breeding Status</th>
                <th className="py-3 px-4">Kidding Schedule</th>
                <th className="py-3 px-4">Litter / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading breeding records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No goat breeding records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const daysRemaining = calculateDaysRemaining(r.expectedKiddingDate);
                  const isPregnant = r.status === "CONFIRMED_PREGNANT";
                  const isCompleted = r.status === "KIDDING_COMPLETED";

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Dam */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/goats/${r.doeId}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                        >
                          {r.doeTagNumber || "Dam Doe"}
                        </Link>
                      </td>

                      {/* Sire */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/goats/${r.buckId}`}
                          className="font-bold text-slate-700 hover:text-emerald-700 hover:underline"
                        >
                          {r.buckTagNumber || "Sire Buck"}
                        </Link>
                      </td>

                      {/* Mating Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatDate(r.matingDate)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPregnant
                              ? "bg-pink-50 text-pink-700 border border-pink-200"
                              : isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isPregnant ? "💖 Pregnant" : isCompleted ? "🍼 Kidding Done" : "Mated"}
                        </span>
                      </td>

                      {/* Expected Kidding */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-800 font-semibold">
                          {formatDate(r.expectedKiddingDate)}
                        </div>
                        {isPregnant && daysRemaining !== null && (
                          <div className="text-[10px] text-pink-600 font-bold mt-0.5">
                            {daysRemaining > 0 ? `In ~${daysRemaining} days` : "Due Any Day!"}
                          </div>
                        )}
                        {isCompleted && r.actualKiddingDate && (
                          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                            Born: {formatDate(r.actualKiddingDate)}
                          </div>
                        )}
                      </td>

                      {/* Notes / Kids */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {r.kidsCount ? (
                          <span className="font-bold text-emerald-700">
                            {r.kidsCount} kid(s) born: {r.notes}
                          </span>
                        ) : (
                          r.notes || "—"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
