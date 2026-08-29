"use client";

import React, { useState } from "react";
import { Pigeon } from "@/types/pigeon";
import { markPigeonDead } from "@/lib/repositories/pigeonRepository";
import { formatRingNumber } from "@/lib/formatters/ringFormatter";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { AlertTriangle, AlertCircle } from "lucide-react";

export interface DeathModalProps {
  pigeon: Pigeon | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPigeon: Pigeon) => void;
}

export function DeathModal({
  pigeon,
  isOpen,
  onClose,
  onSuccess,
}: DeathModalProps) {
  const [deathDate, setDeathDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [deathReason, setDeathReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pigeon) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!deathReason.trim()) {
        throw new Error("Please specify the cause or reason of death.");
      }

      const updated = await markPigeonDead(pigeon.id, {
        deathDate,
        deathReason,
        notes,
      });

      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to record pigeon death.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Pigeon Death"
      subtitle={`Ring: ${formatRingNumber(pigeon)}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold mb-1 flex items-center gap-1.5 text-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Archival Record Notice:
          </p>
          <p>
            Recording demise updates the pigeon status to <strong>DEAD</strong> while safely preserving its bloodline genealogy and breeding history. (To completely remove mistakenly created records, use the <strong>Delete Pigeon</strong> option instead).
          </p>
        </div>

        <Input
          label="Date of Death"
          type="date"
          value={deathDate}
          onChange={(e) => setDeathDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Cause of Death / Symptoms <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={deathReason}
            onChange={(e) => setDeathReason(e.target.value)}
            placeholder="e.g. Acute coccidiosis, severe egg binding, predator injury, old age..."
            required
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Additional Veterinary Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Treatments attempted, autopsy observations..."
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
            variant="danger"
            isLoading={isLoading}
            className="gap-1.5"
          >
            Confirm & Record Death
          </Button>
        </div>
      </form>
    </Modal>
  );
}
