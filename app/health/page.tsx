"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HealthRecord, MedicineSchedule } from "@/types/health";
import { Pigeon } from "@/types/pigeon";
import {
  getHealthRecords,
  getMedicineSchedules,
  getDueMedicineSchedules,
} from "@/lib/repositories/healthRepository";
import { getPigeons } from "@/lib/repositories/pigeonRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { MedicineDueCard } from "@/components/health/MedicineDueCard";
import { HealthRecordModal } from "@/components/health/HealthRecordModal";
import { MedicineScheduleModal } from "@/components/health/MedicineScheduleModal";
import { LiveGoogleDocGuidelines } from "@/components/health/LiveGoogleDocGuidelines";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { HealthSkeleton } from "@/components/ui/Skeleton";
import {
  Pill,
  HeartPulse,
  Calendar,
  Clock,
  PlusCircle,
  ShieldAlert,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function HealthManagementPage() {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [schedules, setSchedules] = useState<MedicineSchedule[]>([]);
  const [dueMeds, setDueMeds] = useState<{
    dueToday: MedicineSchedule[];
    upcoming: MedicineSchedule[];
  }>({ dueToday: [], upcoming: [] });
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);

  const [activeTab, setActiveTab] = useState("schedules");
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [records, scheds, due, allPigeons] = await Promise.all([
        getHealthRecords(),
        getMedicineSchedules(),
        getDueMedicineSchedules(),
        getPigeons(),
      ]);
      setHealthRecords(records);
      setSchedules(scheds);
      setDueMeds(due);
      setPigeons(allPigeons);
    } catch (err) {
      console.error("Error loading health data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
    };
  }, []);

  const pigeonMap = new Map<string, Pigeon>();
  pigeons.forEach((p) => pigeonMap.set(p.id, p));

  if (isLoading) {
    return <HealthSkeleton />;
  }

  const tabsConfig = [
    { id: "schedules", label: "Planned Medicine Courses", icon: Calendar, count: schedules.length },
    { id: "guidelines", label: "Google Doc Guidelines (Live Sync)", icon: FileText },
    { id: "treatments", label: "Treatment Logs", icon: HeartPulse, count: healthRecords.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Health, Veterinary & Medicine Management
            </h1>
            {dueMeds.dueToday.length > 0 && (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Medicine Due Today
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage flock-wide and individual treatments, planned courses, and due
            reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("guidelines")}
            className={`gap-1.5 text-xs font-bold ${
              activeTab === "guidelines"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>মাসিক ঔষধ গাইডলাইন (Doc)</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            className="gap-1.5 text-xs text-slate-700"
          >
            <Calendar className="w-4 h-4" /> Plan Medicine Schedule
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTreatmentModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <HeartPulse className="w-4 h-4" /> Log Treatment Record
          </Button>
        </div>
      </div>

      {/* Top Due Today / Active Courses Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Immediate Health Alerts & Today's Dosages
              </h2>
              {dueMeds.dueToday.length > 0 && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily medical schedule tracking urgent prescriptions, vaccines, and supplements due for administration today or upcoming.
            </p>
          </div>
        </div>

        <MedicineDueCard
          dueToday={dueMeds.dueToday}
          upcoming={dueMeds.upcoming}
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="bg-white rounded-2xl border border-slate-200 px-4 shadow-xs"
      />

      {/* Tab 1: Schedules Table */}
      {activeTab === "schedules" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Planned Medicine Courses & Preventative Protocols ({schedules.length} Scheduled)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calendar courses for deworming, pest control, vaccine cycles, and vitamin therapies scheduled across the farm.
              </p>
            </div>
          </div>

          {/* Quick Real-Time Google Doc Alert */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-rose-50/80 border border-rose-200/90 rounded-2xl text-xs">
            <div className="flex items-center gap-2 text-rose-900">
              <span className="p-1.5 bg-rose-100 rounded-lg text-rose-700">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold">Google Doc Medicine Guidelines:</span>{" "}
                <span className="text-slate-600">
                  Real-time protocol connected for monthly courses and dosage regimens.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("guidelines")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold shadow-2xs self-start sm:self-auto shrink-0 transition-all"
            >
              <span>View Live Doc Protocol</span>
              <span>→</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Medicine / Course</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Schedule Period</th>
                  <th className="py-3 px-4">Dose</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No planned medicine schedules.
                    </td>
                  </tr>
                ) : (
                  schedules.map((s) => {
                    const pigeon = s.pigeonId ? pigeonMap.get(s.pigeonId) : null;

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {s.medicineName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              s.targetType === "FLOCK"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {s.targetType === "FLOCK"
                              ? "Whole Flock"
                              : pigeon
                              ? formatCompactRing(pigeon)
                              : s.pigeonId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {formatDate(s.startDate)} – {formatDate(s.endDate)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {s.dose || "Standard"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {s.purpose || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              s.status === "IN_PROGRESS"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : s.status === "UPCOMING"
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {s.status}
                          </span>
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
      )}

      {/* Tab 2: Live Google Doc Guidelines */}
      {activeTab === "guidelines" && (
        <div className="space-y-3">
          <LiveGoogleDocGuidelines onSchedulesUpdated={loadData} />
        </div>
      )}

      {/* Tab 3: Treatment History Table */}
      {activeTab === "treatments" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Clinical Treatment Logs & Medical Interventions ({healthRecords.length} Records)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Archived clinical logs detailing diagnosed ailments, medications administered, attending handlers, and recovery history.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date Administered</th>
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Dose & Diagnosis</th>
                  <th className="py-3 px-4">Clinical Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {healthRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No treatment records logged yet.
                    </td>
                  </tr>
                ) : (
                  healthRecords.map((h) => {
                    const pigeon = h.pigeonId ? pigeonMap.get(h.pigeonId) : null;

                    return (
                      <tr
                        key={h.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                          {formatDate(h.startDate)} – {formatDate(h.endDate)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {h.medicineName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              h.targetType === "FLOCK"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {h.targetType === "FLOCK"
                              ? "Whole Flock"
                              : pigeon
                              ? formatCompactRing(pigeon)
                              : h.pigeonId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-semibold">{h.purpose || "Therapy"}</div>
                          <div className="text-[11px] text-slate-500">
                            Dose: {h.dose || "Standard"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 italic text-[11px]">
                          {h.notes || "—"}
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
      )}

      {/* Modals */}
      {isTreatmentModalOpen && (
        <HealthRecordModal
          pigeons={pigeons}
          isOpen={isTreatmentModalOpen}
          onClose={() => setIsTreatmentModalOpen(false)}
          onSuccess={loadData}
        />
      )}

      {isScheduleModalOpen && (
        <MedicineScheduleModal
          pigeons={pigeons}
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
