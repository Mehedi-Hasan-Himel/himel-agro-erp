"use client";

import React, { useState } from "react";
import { createFeedPurchase } from "@/lib/repositories/feedRepository";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { ShoppingCart, AlertCircle } from "lucide-react";

export interface FeedPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultFeedType?: string;
}

const COMMON_FEEDS = [
  "Corn / Maize",
  "Wheat",
  "Millet (Bajra)",
  "Mustard Seed",
  "Green Peas (Dabli)",
  "Mineral Grit & Red Stone",
  "Sunflower Seed",
  "Safflower (Kardi)",
  "Paddy / Rice",
  "Other Seed Mix",
];

export function FeedPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  defaultFeedType = "Corn / Maize",
}: FeedPurchaseModalProps) {
  const [feedType, setFeedType] = useState(defaultFeedType);
  const [customFeed, setCustomFeed] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [quantityKg, setQuantityKg] = useState("50");
  const [totalCost, setTotalCost] = useState("2250");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const actualFeedType =
        feedType === "OTHER" ? customFeed.trim() : feedType;
      if (!actualFeedType) {
        throw new Error("Please specify the feed or seed type.");
      }

      const qty = parseFloat(quantityKg);
      const cost = parseFloat(totalCost);

      if (isNaN(qty) || qty <= 0) {
        throw new Error("Please enter a valid positive quantity in kg.");
      }
      if (isNaN(cost) || cost <= 0) {
        throw new Error("Please enter a valid total purchase cost in ৳.");
      }

      await createFeedPurchase({
        feedType: actualFeedType,
        date,
        quantityKg: qty,
        totalCost: cost,
        supplier,
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to record feed purchase.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Feed / Seed Purchase"
      subtitle="Adds stock to inventory and automatically logs an expense transaction."
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
          label="Feed / Seed Type"
          value={feedType}
          onChange={(e) => setFeedType(e.target.value)}
          required
        >
          {COMMON_FEEDS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
          <option value="OTHER">+ Add Other Custom Seed / Feed Type</option>
        </Select>

        {feedType === "OTHER" && (
          <Input
            label="Custom Feed Type Name"
            placeholder="e.g. Safflower Seeds"
            value={customFeed}
            onChange={(e) => setCustomFeed(e.target.value)}
            required
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity (Kg)"
            type="number"
            step="0.5"
            min="0.5"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            required
          />
          <Input
            label="Total Purchase Cost (৳ BDT)"
            type="number"
            min="1"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            required
            helperText="Recorded in farm expenses"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Supplier / Feed Shop"
            placeholder="e.g. Krishi Bitan Wholesale"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Purchase Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bag count, quality grade, grain moisture..."
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
            <ShoppingCart className="w-4 h-4" /> Save Purchase & Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
}
