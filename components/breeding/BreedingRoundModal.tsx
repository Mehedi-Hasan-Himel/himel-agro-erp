"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pair } from "@/types/breeding";
import { createBreedingRound } from "@/lib/repositories/breedingRepository";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { AlertCircle, PlusCircle } from "lucide-react";
import { SquabIcon } from "../ui/icons/SquabIcon";

export interface BreedingRoundModalProps {
  pair: Pair;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BreedingRoundModal({
  pair,
  isOpen,
  onClose,
  onSuccess,
}: BreedingRoundModalProps) {
  const router = useRouter();

  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [hatchDate, setHatchDate] = useState(todayStr);
  const [eggsLaid, setEggsLaid] = useState("2");
  const [babiesHatched, setBabiesHatched] = useState("2");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      maxWidth="md"
    >
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Egg Laying Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Hatching Date"
            type="date"
            value={hatchDate}
            onChange={(e) => setHatchDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Eggs Laid"
            type="number"
            min={0}
            max={10}
            value={eggsLaid}
            onChange={(e) => setEggsLaid(e.target.value)}
            required
            helperText="Typical clutch is 2 eggs"
          />
          <Input
            label="Babies Hatched"
            type="number"
            min={0}
            max={10}
            value={babiesHatched}
            onChange={(e) => setBabiesHatched(e.target.value)}
            required
            helperText="Number of live squabs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Breeding Notes / Observations
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shell texture, feeding vigour, parents brooding behaviour..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Save Round
            </Button>
            {parseInt(babiesHatched, 10) > 0 && (
              <Button
                type="button"
                variant="success"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, true)}
                className="gap-1.5"
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
