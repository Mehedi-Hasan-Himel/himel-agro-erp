"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pigeon } from "@/types/pigeon";
import { deletePigeon, markPigeonDead } from "@/lib/repositories/pigeonRepository";
import { formatRingNumber, formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Trash2, AlertTriangle, AlertCircle, ShieldAlert, Archive } from "lucide-react";

export interface DeletePigeonModalProps {
  pigeon: Pigeon | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeletePigeonModal({
  pigeon,
  isOpen,
  onClose,
  onDeleted,
}: DeletePigeonModalProps) {
  const router = useRouter();
  const [deleteMode, setDeleteMode] = useState<"PERMANENT" | "ARCHIVE_DEAD">("PERMANENT");
  const [confirmText, setConfirmText] = useState("");
  const [deathReason, setDeathReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pigeon) return null;

  const compactId = formatCompactRing(pigeon);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (deleteMode === "PERMANENT") {
        if (confirmText.trim() !== compactId && confirmText.trim().toLowerCase() !== "delete") {
          throw new Error(`Please type "${compactId}" or "DELETE" to confirm permanent deletion.`);
        }
        await deletePigeon(pigeon.id);
        onClose();
        if (onDeleted) {
          onDeleted();
        } else {
          router.push("/pigeons");
          router.refresh();
        }
      } else {
        if (!deathReason.trim()) {
          throw new Error("Please specify the cause or reason of death.");
        }
        await markPigeonDead(pigeon.id, {
          deathDate: new Date().toISOString().split("T")[0],
          deathReason,
        });
        onClose();
        if (onDeleted) {
          onDeleted();
        } else {
          router.refresh();
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete pigeon.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete or Archive Pigeon"
      subtitle={`Pigeon ID: ${compactId} • ${formatRingNumber(pigeon)}`}
      maxWidth="md"
    >
      <form onSubmit={handleDelete} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setDeleteMode("PERMANENT")}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              deleteMode === "PERMANENT"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Permanent Delete</span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteMode("ARCHIVE_DEAD")}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              deleteMode === "ARCHIVE_DEAD"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Mark as Dead</span>
          </button>
        </div>

        {deleteMode === "PERMANENT" ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-rose-700">
                <ShieldAlert className="w-4 h-4" /> Permanent Deletion:
              </p>
              <p>
                This will <strong>completely and permanently remove</strong> pigeon{" "}
                <span className="font-mono font-bold text-rose-800">{compactId}</span> from your ERP database.
                Use this if the pigeon was registered by mistake or is a duplicate.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Type <span className="font-mono text-rose-600 font-bold">{compactId}</span> or <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm:
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type ${compactId} or DELETE`}
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-slate-800 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Archival Record:
              </p>
              <p>
                The pigeon status will change to <strong>DEAD</strong>. Its bloodline and pedigree history will remain safely preserved in your farm records.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Cause of Death / Symptoms <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={deathReason}
                onChange={(e) => setDeathReason(e.target.value)}
                placeholder="e.g. Sickness, old age, injury..."
                required
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>
        )}

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
            <Trash2 className="w-4 h-4" />
            {deleteMode === "PERMANENT" ? "Confirm Permanent Delete" : "Confirm & Mark Dead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
