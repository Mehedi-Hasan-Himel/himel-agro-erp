"use client";

import React, { useState } from "react";
import { FeedStockSummary } from "@/types/feed";
import { createFeedUsage } from "@/lib/repositories/feedRepository";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { TrendingDown, AlertCircle } from "lucide-react";

export interface FeedUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  summaries: FeedStockSummary[];
  defaultFeedType?: string;
}

export function FeedUsageModal({
  isOpen,
  onClose,
  onSuccess,
  summaries,
  defaultFeedType,
}: FeedUsageModalProps) {
  const initialType =
    defaultFeedType || (summaries.length > 0 ? summaries[0].feedType : "Corn / Maize");
  const [feedType, setFeedType] = useState(initialType);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [quantityKg, setQuantityKg] = useState("5");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSummary = summaries.find((s) => s.feedType === feedType);
  const maxAvailable = currentSummary ? currentSummary.currentStockKg : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const qty = parseFloat(quantityKg);
      if (isNaN(qty) || qty <= 0) {
        throw new Error("Please enter a valid positive quantity in kg.");
      }
      if (qty > maxAvailable) {
        throw new Error(
          `Cannot use ${qty}kg. Only ${maxAvailable}kg is currently available in stock.`
        );
      }

      await createFeedUsage({
        feedType,
        date,
        quantityKg: qty,
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to record feed consumption.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Feed Usage / Consumption"
      subtitle="Deducts grain weight from current available stock."
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
          label="Select Feed Type"
          value={feedType}
          onChange={(e) => setFeedType(e.target.value)}
          required
        >
          {summaries.map((s) => (
            <option key={s.feedType} value={s.feedType}>
              {s.feedType} (In stock: {s.currentStockKg}kg)
            </option>
          ))}
        </Select>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Currently in stock:</span>
          <span className="font-bold text-slate-800 text-sm">
            {maxAvailable} kg
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity Used (Kg)"
            type="number"
            step="0.5"
            min="0.1"
            max={maxAvailable}
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            required
            helperText={`Max available: ${maxAvailable}kg`}
          />
          <Input
            label="Usage Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Usage Notes / Target
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Daily flock feeding, squab weaning nursery mix..."
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
            disabled={maxAvailable <= 0}
            className="gap-1.5"
          >
            <TrendingDown className="w-4 h-4" /> Deduct from Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
}
