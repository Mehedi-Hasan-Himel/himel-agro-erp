"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pair } from "@/types/breeding";
import { createBreedingRound } from "@/lib/repositories/breedingRepository";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { AlertCircle, PlusCircle, Egg, Calendar, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { SquabIcon } from "../ui/icons/SquabIcon";

export interface BreedingRoundModalProps {
  pair: Pair;
  activeSerial?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Adds a specific number of days to a YYYY-MM-DD date string in a timezone-safe manner.
 */
function addDaysToDate(dateStr: string, days: number): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some(isNaN)) return "";
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function BreedingRoundModal({
  pair,
  activeSerial,
  isOpen,
  onClose,
  onSuccess,
}: BreedingRoundModalProps) {
  const router = useRouter();

  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [selectedIncubationDays, setSelectedIncubationDays] = useState<number>(18);
  const [hatchDate, setHatchDate] = useState(() => addDaysToDate(todayStr, 18));
  const [eggsLaid, setEggsLaid] = useState("2");
  const [babiesHatched, setBabiesHatched] = useState("2");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate Hatching Date when Egg Laying Date changes
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (newDate) {
      const days = selectedIncubationDays || 18;
      setHatchDate(addDaysToDate(newDate, days));
    }
  };

  // Quick select 18, 19, or 20 incubation days
  const handleSelectDays = (days: number) => {
    setSelectedIncubationDays(days);
    if (date) {
      setHatchDate(addDaysToDate(date, days));
    }
  };

  // Manual change to Hatching Date
  const handleHatchDateChange = (newHatchDate: string) => {
    setHatchDate(newHatchDate);
    if (date && newHatchDate) {
      if (newHatchDate === addDaysToDate(date, 18)) setSelectedIncubationDays(18);
      else if (newHatchDate === addDaysToDate(date, 19)) setSelectedIncubationDays(19);
      else if (newHatchDate === addDaysToDate(date, 20)) setSelectedIncubationDays(20);
      else setSelectedIncubationDays(0);
    }
  };

  // Incubation progress calculation
  const getIncubationStatus = () => {
    if (!date) return null;
    const parts = date.split("-").map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const eggTime = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.round((todayMidnight - eggTime) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Future planned round (starts in ${Math.abs(diffDays)} days)`,
        type: "future",
      };
    } else if (diffDays >= 0 && diffDays < 18) {
      const remaining = 18 - diffDays;
      return {
        label: `Incubation in progress: Day ${diffDays + 1} of ~18 (approx. ${remaining} day${remaining === 1 ? "" : "s"} left to hatch)`,
        type: "incubating",
      };
    } else if (diffDays >= 18 && diffDays <= 20) {
      return {
        label: `Hatching window is active right now (Day ${diffDays} of incubation) 🐣`,
        type: "hatching",
      };
    } else {
      return {
        label: `Incubation completed (${diffDays} days since laying)`,
        type: "past",
      };
    }
  };

  const statusInfo = getIncubationStatus();

  const handleSubmit = async (e: React.FormEvent, andRegisterBaby = false) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const eggs = parseInt(eggsLaid, 10);
      const hatched = parseInt(babiesHatched, 10);

      if (isNaN(eggs) || eggs < 0) {
        throw new Error("Please enter a valid number of eggs laid.");
      }
      if (isNaN(hatched) || hatched < 0) {
        throw new Error("Please enter a valid number of babies hatched.");
      }
      if (hatched > eggs) {
        throw new Error(
          `Babies hatched (${hatched}) cannot be greater than eggs laid (${eggs}).`
        );
      }

      await createBreedingRound({
        pairId: pair.id,
        date,
        hatchDate,
        eggsLaid: eggs,
        babiesHatched: hatched,
        notes,
      });

      onSuccess();
      onClose();

      if (andRegisterBaby && hatched > 0) {
        router.push(
          `/pigeons/new?fatherId=${pair.maleId}&motherId=${pair.femaleId}&hatchDate=${hatchDate}`
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to record breeding round.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Breeding Round"
      subtitle={`Breeding Pair: ${pair.id}`}
      maxWidth="lg"
    >
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pair Summary Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {activeSerial && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-xs font-black shadow-2xs">
                #{activeSerial}
              </span>
            )}
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pair</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-800">{pair.id}</span>
            {pair.cageNumber && (
              <span className="text-[10px] font-medium bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                Cage {pair.cageNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60 text-[11px] sm:text-xs">
              ♂ {pair.maleId}
            </span>
            <span className="text-slate-400 font-bold">×</span>
            <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/60 text-[11px] sm:text-xs">
              ♀ {pair.femaleId}
            </span>
          </div>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Egg Laying Date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            required
            helperText="Date eggs were laid by hen"
          />
          <Input
            label="Approx Hatching Date"
            type="date"
            value={hatchDate}
            onChange={(e) => handleHatchDateChange(e.target.value)}
            helperText="Auto-calculated (18–20 days)"
          />
        </div>

        {/* 18–20 Days Auto-Calculation Card */}
        {date && (
          <div className="p-3 sm:p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200/90 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Egg className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Estimated Hatching Window</span>
              </div>
              <span className="text-[10px] font-bold font-mono bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-700" />
                18–20 Days
              </span>
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed">
              Eggs laid on <strong className="font-semibold text-slate-900">{formatDate(date)}</strong> should hatch between{" "}
              <strong className="font-semibold text-slate-900 font-mono">{formatDate(addDaysToDate(date, 18))}</strong> and{" "}
              <strong className="font-semibold text-slate-900 font-mono">{formatDate(addDaysToDate(date, 20))}</strong>.
            </p>

            {/* Quick Incubation Days Selector Chips */}
            <div className="pt-2 border-t border-amber-200/70 space-y-1.5">
              <span className="text-[11px] font-semibold text-amber-900 block">Quick Set Target Date:</span>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[18, 19, 20].map((days) => {
                  const target = addDaysToDate(date, days);
                  const isSelected = hatchDate === target;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleSelectDays(days)}
                      className={`py-1.5 px-1 sm:px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-amber-700 text-white shadow-xs font-bold ring-2 ring-amber-500/40"
                          : "bg-white text-slate-700 border border-amber-300 hover:bg-amber-100/80"
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">+{days} Days</span>
                      <span className={`text-[10px] font-mono leading-tight mt-0.5 ${isSelected ? "text-amber-100" : "text-amber-800"}`}>
                        {formatDate(target)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Incubation Status */}
            {statusInfo && (
              <div className="text-[11px] font-medium text-amber-800 flex items-start sm:items-center gap-1.5 pt-1 border-t border-amber-200/50">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                <span className="leading-tight">{statusInfo.label}</span>
              </div>
            )}
          </div>
        )}

        {/* Eggs & Hatching Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Total Eggs Laid <span className="text-rose-600 font-black">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Typical: 2</span>
            </div>
            <input
              type="number"
              min={0}
              max={10}
              value={eggsLaid}
              onChange={(e) => setEggsLaid(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm sm:text-base text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/25 transition-colors"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-medium shrink-0">Quick:</span>
              {["1", "2"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEggsLaid(val)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    eggsLaid === val
                      ? "bg-slate-800 text-white border-slate-800 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {val} Egg{val === "1" ? "" : "s"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Babies Hatched <span className="text-rose-600 font-black">*</span>
              </label>
              <span className="text-[11px] text-slate-400">0 if incubating</span>
            </div>
            <input
              type="number"
              min={0}
              max={10}
              value={babiesHatched}
              onChange={(e) => setBabiesHatched(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm sm:text-base text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/25 transition-colors"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-medium shrink-0">Quick:</span>
              {[
                { val: "0", label: "0 Incubating" },
                { val: "1", label: "1 Squab" },
                { val: "2", label: "2 Squabs" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setBabiesHatched(item.val)}
                  className={`text-[11px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                    babiesHatched === item.val
                      ? "bg-emerald-700 text-white border-emerald-700 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Breeding Notes / Observations
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shell texture, fertility candling, brooding behaviour..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-2 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto justify-center"
          >
            Cancel
          </Button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full sm:w-auto justify-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> Save Round
            </Button>
            {parseInt(babiesHatched, 10) > 0 && (
              <Button
                type="button"
                variant="success"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, true)}
                className="w-full sm:w-auto justify-center gap-1.5 shadow-xs"
                title="Save this round and immediately register newborn baby ring"
              >
                <SquabIcon className="w-4 h-4" /> Save & Register Baby
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
