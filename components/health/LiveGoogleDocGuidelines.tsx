"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleDocMedicineGuidelines,
  GoogleDocMedicineGroup,
  GoogleDocMedicineCourse,
} from "@/types/health";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pill,
  Sparkles,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export interface LiveGoogleDocGuidelinesProps {
  onSchedulesUpdated?: () => void;
}

export function LiveGoogleDocGuidelines({ onSchedulesUpdated }: LiveGoogleDocGuidelinesProps) {
  const [guidelines, setGuidelines] = useState<GoogleDocMedicineGuidelines | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("group_3");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchLiveGuidelines = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const res = await fetch("/api/sync/google-docs", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.guidelines) {
          setGuidelines(data.guidelines);
          setLastRefreshed(new Date());

          // Default select active group
          if (data.guidelines.activeGroup?.id) {
            setSelectedGroupId(data.guidelines.activeGroup.id);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch Google Doc guidelines:", err);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, []);

  // Poll in real-time every 30 seconds
  useEffect(() => {
    fetchLiveGuidelines();
    const interval = setInterval(() => {
      fetchLiveGuidelines(true);
    }, 30000);

    const handleFocus = () => fetchLiveGuidelines(true);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchLiveGuidelines]);

  // Synchronize Google Doc into ERP schedules
  const handleSyncToSchedules = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/sync/google-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(data.message || "Successfully synced Google Doc with ERP schedules!");
        await fetchLiveGuidelines(true);
        if (onSchedulesUpdated) onSchedulesUpdated();
      } else {
        setSyncMessage("Sync failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setSyncMessage("Sync failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const selectedGroup =
    guidelines?.groups.find((g) => g.id === selectedGroupId) || guidelines?.activeGroup || guidelines?.groups[0];

  const currentMonthNum = new Date().getMonth() + 1;
  const currentDayNum = new Date().getDate();

  return (
    <Card className="border-rose-200/90 shadow-xs bg-gradient-to-b from-white to-rose-50/20 overflow-hidden">
      {/* Top Header */}
      <CardHeader className="border-b border-rose-100 bg-rose-50/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                <FileText className="w-4 h-4" />
              </span>
              <CardTitle className="text-sm sm:text-base font-extrabold text-slate-900">
                {guidelines?.title || "কবুতরের মাসিক ঔষধের কোর্স ও ব্যবহার বিধি"}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Real-Time Sync
              </span>
              <span>•</span>
              <span>Updated: {lastRefreshed.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLiveGuidelines()}
              isLoading={isLoading}
              className="gap-1.5 text-xs text-slate-700 bg-white"
              title="Refresh from Google Doc now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Doc</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSyncToSchedules}
              isLoading={isSyncing}
              className="gap-1.5 text-xs bg-rose-600 hover:bg-rose-700"
              title="Sync active courses into ERP planned medicine schedules"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sync to Calendar</span>
            </Button>

            {guidelines?.documentUrl && (
              <a
                href={guidelines.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
                title="Open live Google Doc"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Open Doc</span>
              </a>
            )}
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {syncMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Special Notice Banner from Doc */}
        {guidelines?.specialNotice && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{guidelines.specialNotice}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Group Selector Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Monthly Medicine Group
            </span>
            {guidelines?.activeGroup && (
              <span className="text-[11px] font-bold text-rose-700 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-full">
                Active This Month ({new Date().toLocaleString("en-US", { month: "long" })})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {guidelines?.groups.map((group) => {
              const isActiveMonthGroup = group.applicableMonths.includes(currentMonthNum);
              const isSelected = group.id === selectedGroupId;

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`p-3 rounded-xl text-left border transition-all relative ${
                    isSelected
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : isActiveMonthGroup
                      ? "bg-rose-50 text-slate-800 border-rose-300 hover:border-rose-400"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs">
                      গ্রুপ {group.groupNumber}
                    </span>
                    {isActiveMonthGroup && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-rose-200 text-rose-800"
                        }`}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[10px] mt-1 font-medium line-clamp-1 ${
                      isSelected ? "text-rose-100" : "text-slate-500"
                    }`}
                  >
                    {group.monthNamesText}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Group Header */}
        {selectedGroup && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>📋</span>
                <span>{selectedGroup.title}</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {selectedGroup.courses.length} Prescribed Courses
              </span>
            </div>

            {/* Courses Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {selectedGroup.courses.map((course) => {
                const isCurrentGroupActive = selectedGroup.applicableMonths.includes(currentMonthNum);
                const isCurrentlyDue =
                  isCurrentGroupActive &&
                  currentDayNum >= course.startDay &&
                  currentDayNum <= course.endDay;

                return (
                  <div
                    key={course.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isCurrentlyDue
                        ? "bg-rose-50/60 border-rose-300 shadow-sm ring-1 ring-rose-300"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-xs text-slate-900 leading-snug">
                          {course.title}
                        </span>
                        {isCurrentlyDue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shrink-0 animate-pulse">
                            ACTIVE NOW
                          </span>
                        )}
                      </div>

                      {/* Date Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.dateRangeText || `Day ${course.startDay} - ${course.endDay}`}</span>
                        <span className="text-slate-400">({course.durationDays} দিন)</span>
                      </div>

                      {/* Medicine & Dose */}
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex items-start gap-1.5 text-slate-800">
                          <Pill className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="font-bold">{course.medicine}</span>
                        </div>
                        {course.dose && (
                          <div className="flex items-start gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="font-semibold text-slate-700 shrink-0">পরিমাণ:</span>
                            <span>{course.dose}</span>
                          </div>
                        )}
                        {course.benefits && (
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-600 pt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{course.benefits}</span>
                          </div>
                        )}
                        {course.instructions && (
                          <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                            <span className="font-semibold shrink-0">প্রয়োগ বিধি:</span>
                            <span>{course.instructions}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Break Period Notice */}
                    {course.breakText && (
                      <div className="text-[10px] font-medium text-slate-500 bg-slate-100/80 px-2 py-1.5 rounded-lg border border-slate-200/60">
                        {course.breakText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
