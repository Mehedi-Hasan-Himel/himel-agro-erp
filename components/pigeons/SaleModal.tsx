"use client";

import React, { useState } from "react";
import { Pigeon } from "@/types/pigeon";
import { markPigeonSold } from "@/lib/repositories/pigeonRepository";
import { formatRingNumber } from "@/lib/formatters/ringFormatter";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { AlertCircle } from "lucide-react";
import { TakaIcon } from "../ui/icons";

export interface SaleModalProps {
  pigeon: Pigeon | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPigeon: Pigeon) => void;
}

export function SaleModal({
  pigeon,
  isOpen,
  onClose,
  onSuccess,
}: SaleModalProps) {
  const [saleDate, setSaleDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [salePrice, setSalePrice] = useState<string>("5000");
  const [buyer, setBuyer] = useState<string>("");
  const [saleReason, setSaleReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pigeon) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const price = parseFloat(salePrice);
      if (isNaN(price) || price < 0) {
        throw new Error("Please enter a valid positive sale price.");
      }

      const updated = await markPigeonSold(pigeon.id, {
        saleDate,
        salePrice: price,
        buyer,
        saleReason,
        notes,
      });

      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to record pigeon sale.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Pigeon Sale"
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

        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 leading-relaxed">
          <p className="font-semibold mb-1">Permanent Historical Record Policy:</p>
          <p>
            The pigeon will be marked as <strong>SOLD</strong> and an income
            transaction of <strong>৳{salePrice || 0}</strong> will automatically
            be recorded in farm finances. All pedigree lineage, breeding, and
            flight history will remain permanently preserved.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Sale Date"
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            required
          />
          <Input
            label="Sale Price (৳ BDT)"
            type="number"
            min={0}
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            required
            helperText="Recorded in farm income"
          />
        </div>

        <Input
          label="Buyer Name / Contact"
          placeholder="e.g. Tanvir Ahmed, Uttara (01712...)"
          value={buyer}
          onChange={(e) => setBuyer(e.target.value)}
          required
        />

        <Input
          label="Sale Purpose / Reason"
          placeholder="e.g. Sold for local tournament / Breeding stock"
          value={saleReason}
          onChange={(e) => setSaleReason(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Additional Sale Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment method, delivery details, terms..."
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
            <TakaIcon className="w-4 h-4" /> Record Sale & Income
          </Button>
        </div>
      </form>
    </Modal>
  );
}
