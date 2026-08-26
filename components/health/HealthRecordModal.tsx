"use client";

import React, { useState } from "react";
import { Pigeon } from "@/types/pigeon";
import { createHealthRecord } from "@/lib/repositories/healthRepository";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { HeartPulse, AlertCircle } from "lucide-react";

export interface HealthRecordModalProps {
  pigeons: Pigeon[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPigeonId?: string;
}

export function HealthRecordModal({
  pigeons,
  isOpen,
  onClose,
  onSuccess,
  defaultPigeonId,
}: HealthRecordModalProps) {
  const [targetType, setTargetType] = useState<"INDIVIDUAL" | "FLOCK">(
    defaultPigeonId ? "INDIVIDUAL" : "FLOCK"
  );
  const [pigeonId, setPigeonId] = useState(defaultPigeonId || "");
  const [medicineName, setMedicineName] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dose, setDose] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!medicineName.trim()) {
        throw new Error("Please enter the medicine or supplement name.");
      }
      if (targetType === "INDIVIDUAL" && !pigeonId) {
        throw new Error("Please select the individual pigeon to treat.");
      }

      await createHealthRecord({
        targetType,
        pigeonId: targetType === "INDIVIDUAL" ? pigeonId : null,
        medicineName,
        startDate,
        endDate,
        dose,
        purpose,
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to record treatment log.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Health & Treatment Record"
      subtitle="Record individual pigeon therapy or flock-wide preventative course."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Treatment Target"
          value={targetType}
          onChange={(e) =>
            setTargetType(e.target.value as "INDIVIDUAL" | "FLOCK")
          }
          required
        >
          <option value="FLOCK">Whole Flock Treatment</option>
          <option value="INDIVIDUAL">Specific Individual Pigeon</option>
        </Select>

        {targetType === "INDIVIDUAL" && (
          <Select
            label="Select Pigeon"
            value={pigeonId}
            onChange={(e) => setPigeonId(e.target.value)}
            required
          >
            <option value="">-- Choose Pigeon --</option>
            {pigeons.map((p) => (
              <option key={p.id} value={p.id}>
                {formatCompactRing(p)} — {p.breedSubtype || p.breed} ({p.sex})
              </option>
            ))}
          </Select>
        )}

        <Input
          label="Medicine / Treatment Name"
          placeholder="e.g. Tylosin Tartrate 20%, Electromin, Wormnil..."
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Dosage / Administration"
            placeholder="e.g. 2g / Litre drinking water"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
          />
          <Input
            label="Purpose / Diagnosis"
            placeholder="e.g. Coccidiosis, heat recovery..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Treatment Notes / Observations
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Recovery speed, symptoms observed, follow-up..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="gap-1.5"
          >
            <HeartPulse className="w-4 h-4" /> Save Treatment Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
