"use client";

import React, { useState } from "react";
import { TransactionType } from "@/types/finance";
import { createTransaction } from "@/lib/repositories/financeRepository";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { AlertCircle } from "lucide-react";
import { TakaIcon } from "../ui/icons";

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: TransactionType;
}

const EXPENSE_CATEGORIES = [
  "Feed",
  "Medicine",
  "Cage/Loft Equipment",
  "Transportation",
  "Pigeon Purchase",
  "Ring Tag Purchase",
  "Other",
];

const INCOME_CATEGORIES = [
  "Pigeon Sale",
  "Breeding Service",
  "Prize Money",
  "Other",
];

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = "EXPENSE",
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState<string>(
    defaultType === "EXPENSE" ? "Feed" : "Pigeon Sale"
  );
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories =
    type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === "EXPENSE" ? "Feed" : "Pigeon Sale");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Please enter a valid positive transaction amount in ৳.");
      }

      await createTransaction({
        type,
        category,
        amount: parsedAmount,
        date,
        description,
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create transaction.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Financial Transaction"
      subtitle="Log direct income or expense in farm accounting."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange("EXPENSE")}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === "EXPENSE"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("INCOME")}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === "INCOME"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Income (+)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Input
            label="Amount (৳ BDT)"
            type="number"
            min="1"
            placeholder="e.g. 1500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <Input
          label="Transaction Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Input
          label="Description / Purpose"
          placeholder="e.g. 2x Stainless Steel Feeding Trays"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Additional Notes / Invoice Ref
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Receipt number, payment method..."
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
            variant={type === "INCOME" ? "success" : "danger"}
            isLoading={isLoading}
            className="gap-1.5"
          >
            <TakaIcon className="w-4 h-4" /> Save {type === "INCOME" ? "Income" : "Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
