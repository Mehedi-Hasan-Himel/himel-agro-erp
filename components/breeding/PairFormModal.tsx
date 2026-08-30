"use client";

import React, { useState } from "react";
import { Pigeon } from "@/types/pigeon";
import { createPair } from "@/lib/repositories/breedingRepository";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { AlertCircle, GitFork } from "lucide-react";

export interface PairFormModalProps {
  pigeons: Pigeon[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMaleId?: string;
  defaultFemaleId?: string;
}

export function PairFormModal({
  pigeons,
  isOpen,
  onClose,
  onSuccess,
  defaultMaleId = "",
  defaultFemaleId = "",
}: PairFormModalProps) {
  const [maleId, setMaleId] = useState(defaultMaleId);
  const [femaleId, setFemaleId] = useState(defaultFemaleId);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [cageNumber, setCageNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const malePigeons = pigeons.filter(
    (p) => p.sex === "MALE" && p.status === "ACTIVE"
  );
  const femalePigeons = pigeons.filter(
    (p) => p.sex === "FEMALE" && p.status === "ACTIVE"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!maleId) throw new Error("Please select a male cock.");
      if (!femaleId) throw new Error("Please select a female hen.");
      if (maleId === femaleId) {
        throw new Error("Cannot pair a pigeon with itself.");
      }

      await createPair({
        maleId,
        femaleId,
        startDate,
        cageNumber,
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create breeding pair.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Breeding Pair"
      subtitle="Pair male cock with female hen for structured bloodline breeding."
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
          label="Select Male (Sire)"
          value={maleId}
          onChange={(e) => setMaleId(e.target.value)}
          required
        >
          <option value="">-- Choose Active Male --</option>
          {malePigeons.map((m) => (
            <option key={m.id} value={m.id}>
              {formatCompactRing(m)} — {m.breedSubtype || m.breed} ({m.ringYear})
            </option>
          ))}
        </Select>

        <Select
          label="Select Female (Dam)"
          value={femaleId}
          onChange={(e) => setFemaleId(e.target.value)}
          required
        >
          <option value="">-- Choose Active Female --</option>
          {femalePigeons.map((f) => (
            <option key={f.id} value={f.id}>
              {formatCompactRing(f)} — {f.breedSubtype || f.breed} ({f.ringYear})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Pairing Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Cage / Loft Unit Number"
            placeholder="e.g. Loft A - Cage 04"
            value={cageNumber}
            onChange={(e) => setCageNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Breeding Target & Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Target bloodline traits, feather structure, flight speed goals..."
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
            <GitFork className="w-4 h-4" /> Form Breeding Pair
          </Button>
        </div>
      </form>
    </Modal>
  );
}
