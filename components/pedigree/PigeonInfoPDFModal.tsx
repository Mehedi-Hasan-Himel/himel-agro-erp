"use client";

import React, { useState } from "react";
import { Pigeon } from "@/types/pigeon";
import { HatchingStats } from "@/types/breeding";
import { FlyingRecord } from "@/types/flying";
import { HealthRecord } from "@/types/health";
import { FamilyTreeSummary } from "@/lib/calculations/relationshipCalculator";
import { exportPedigreeToPdf } from "@/lib/pedigree/pdfExport";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PrintablePigeonInfo } from "./PrintablePigeonInfo";
import { Download, Printer, CheckCircle, AlertCircle } from "lucide-react";

export interface PigeonInfoPDFModalProps {
  pigeon: Pigeon | null;
  father?: Pigeon | null;
  mother?: Pigeon | null;
  familySummary?: FamilyTreeSummary | null;
  hatchingStats?: HatchingStats | null;
  flyingRecords?: FlyingRecord[];
  healthRecords?: HealthRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export function PigeonInfoPDFModal({
  pigeon,
  father,
  mother,
  familySummary,
  hatchingStats,
  flyingRecords,
  healthRecords,
  isOpen,
  onClose,
}: PigeonInfoPDFModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pigeon) return null;

  const infoElementId = "printable-pigeon-info-pdf-view";
  const compactRing = formatCompactRing(pigeon);
  const filename = `Himel-Agro-Pigeon-Info-${compactRing}.pdf`;

  const handleDownloadPdf = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      await exportPedigreeToPdf(infoElementId, filename, "portrait");
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to download Pigeon Info PDF.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pigeon Info Dossier Preview & Download"
      subtitle={`Comprehensive Historical Document for ${pigeon.id} (${compactRing})`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>A4 Portrait Official History Layout</span>
            {downloadSuccess && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" /> PDF Downloaded Successfully!
              </span>
            )}
            {error && (
              <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-100 px-2 py-0.5 rounded-md">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNativePrint}
              className="gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Document
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isGenerating}
              onClick={handleDownloadPdf}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" /> Download Pigeon Info PDF
            </Button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="overflow-x-auto p-2 sm:p-4 bg-slate-200/60 rounded-2xl border border-slate-300 flex justify-center">
          <PrintablePigeonInfo
            id={infoElementId}
            pigeon={pigeon}
            father={father}
            mother={mother}
            familySummary={familySummary}
            hatchingStats={hatchingStats}
            flyingRecords={flyingRecords}
            healthRecords={healthRecords}
          />
        </div>
      </div>
    </Modal>
  );
}
