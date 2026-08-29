"use client";

import React from "react";
import { MedicineSchedule } from "@/types/health";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { Pill, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export interface MedicineDueCardProps {
  dueToday: MedicineSchedule[];
  upcoming: MedicineSchedule[];
  onScheduleClick?: () => void;
}

export function MedicineDueCard({
  dueToday,
  upcoming,
  onScheduleClick,
}: MedicineDueCardProps) {
  return (
    <Card className="border-emerald-200/80 shadow-xs">
      <CardHeader className="bg-slate-50/50">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-600" />
          <span>Medicine & Treatment Protocol</span>
        </CardTitle>
        <Link
          href="/health"
          className="text-xs font-semibold text-emerald-700 hover:underline"
        >
          View All →
        </Link>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Due Today Section */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg mb-2.5 inline-flex">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Medicine Due Today</span>
          </div>

          {dueToday.length === 0 ? (
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No medications due today. Flock is in healthy state!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {dueToday.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/70 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-slate-900 text-xs">
                      {item.medicineName}
                    </h5>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {item.targetType === "FLOCK"
                        ? "Whole Flock"
                        : `Pigeon ${item.pigeonId}`}
                    </span>
                  </div>
                  {item.dose && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">Dose:</span> {item.dose}
                    </p>
                  )}
                  {item.purpose && (
                    <p className="text-[11px] text-slate-500">
                      <span className="font-semibold">Purpose:</span> {item.purpose}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium">
                    Schedule: {formatDate(item.startDate)} – {formatDate(item.endDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Courses Section */}
        {upcoming.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Upcoming Planned Courses
            </span>
            <div className="space-y-2">
              {upcoming.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between"
                >
                  <div>
                    <h6 className="font-semibold text-slate-800 text-xs">
                      {item.medicineName}
                    </h6>
                    <span className="text-[10px] text-slate-400">
                      Starts: {formatDate(item.startDate)} (
                      {item.targetType === "FLOCK" ? "Flock" : "Individual"})
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    Upcoming
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
