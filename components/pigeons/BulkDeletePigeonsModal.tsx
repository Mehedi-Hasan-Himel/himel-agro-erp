"use client";

import React, { useState } from "react";
import { Pigeon } from "@/types/pigeon";
import { deletePigeonsBulk } from "@/lib/repositories/pigeonRepository";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Trash2, AlertCircle, ShieldAlert } from "lucide-react";

export interface BulkDeletePigeonsModalProps {
  pigeons: Pigeon[];
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function BulkDeletePigeonsModal({
  pigeons,
  isOpen,
  onClose,
  onDeleted,
}: BulkDeletePigeonsModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || pigeons.length === 0) return null;

  const count = pigeons.length;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setError('Please type "DELETE" to confirm.');
      return;
    }

    setIsLoading(true);
    try {
      const ids = pigeons.map((p) => p.id);
      await deletePigeonsBulk(ids);
      setConfirmText("");
      onClose();
      onDeleted();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete selected pigeons.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) {
          setConfirmText("");
          setError(null);
          onClose();
        }
      }}
      title="Bulk Delete Pigeons"
      subtitle={`${count} pigeon${count > 1 ? "s" : ""} selected for permanent deletion`}
      maxWidth="md"
    >
      <form onSubmit={handleDelete} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-rose-700">
            <ShieldAlert className="w-4 h-4" /> Permanent Bulk Action:
          </p>
          <p>
            You are about to permanently delete <strong>{count} pigeon{count > 1 ? "s" : ""}</strong> from your farm database.
            This action <strong>cannot be undone</strong>. Any active pairs containing these birds will also be ended.
          </p>
        </div>

        {/* List of birds to be deleted */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Birds to be deleted ({count}):
          </label>
          <div className="max-h-36 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 divide-y divide-slate-100">
            {pigeons.map((p) => (
              <div key={p.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-800">
                  {formatCompactRing(p)}
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                  {p.breedSubtype || p.breed} • {p.sex}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Type <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm:
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            required
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmText("");
              setError(null);
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={isLoading}
            disabled={confirmText.trim().toUpperCase() !== "DELETE"}
            className="gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete {count} Pigeon{count > 1 ? "s" : ""}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default BulkDeletePigeonsModal;
