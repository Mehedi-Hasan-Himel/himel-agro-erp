"use client";

import React, { useState } from "react";
import { Pigeon } from "@/types/pigeon";
import { createMedicineSchedule } from "@/lib/repositories/healthRepository";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Calendar, AlertCircle } from "lucide-react";

export interface MedicineScheduleModalProps {
  pigeons: Pigeon[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MedicineScheduleModal({
  pigeons,
  isOpen,
  onClose,
  onSuccess,
}: MedicineScheduleModalProps) {
  const [medicineName, setMedicineName] = useState("");
  const [targetType, setTargetType] = useState<"FLOCK" | "INDIVIDUAL">("FLOCK");
  const [pigeonId, setPigeonId] = useState("");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [dose, setDose] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState<"UPCOMING" | "IN_PROGRESS">("UPCOMING");
  const [notes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!medicineName.trim()) {
        throw new Error("Please enter the medicine or supplement course name.");
      }

      await createMedicineSchedule({
        medicineName,
        targetType,
        pigeonId: targetType === "INDIVIDUAL" ? pigeonId : null,
        startDate,
        endDate,
        dose,
        purpose,
        status,
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to schedule planned medicine course.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plan Medicine Schedule"
      subtitle="Schedule upcoming preventative or conditioning medicine courses."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Medicine / Supplement Name"
          placeholder="e.g. Calci-D3 Plus Liquid, Hepaprotect Liver Tonic..."
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Target Audience"
            value={targetType}
            onChange={(e) =>
              setTargetType(e.target.value as "FLOCK" | "INDIVIDUAL")
            }
            required
          >
            <option value="FLOCK">Whole Flock</option>
            <option value="INDIVIDUAL">Specific Pigeon</option>
          </Select>

          <Select
            label="Course Status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "UPCOMING" | "IN_PROGRESS")
            }
            required
          >
            <option value="UPCOMING">Upcoming Planned</option>
            <option value="IN_PROGRESS">Currently Active / Due</option>
          </Select>
        </div>

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
                {formatCompactRing(p)} — {p.breedSubtype || p.breed}
              </option>
            ))}
          </Select>
        )}

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
            label="Dose / Water Ratio"
            placeholder="e.g. 5ml / Litre drinking water"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
          />
          <Input
            label="Purpose / Goal"
            placeholder="e.g. Pre-breeding calcium fortification"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
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
            <Calendar className="w-4 h-4" /> Save Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
