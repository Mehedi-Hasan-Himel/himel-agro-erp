"use client";

import React, { useState } from "react";
import { PedigreeNodeData } from "@/types/pedigree";
import { exportPedigreeToPdf } from "@/lib/pedigree/pdfExport";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { PrintablePedigree } from "./PrintablePedigree";
import { Download, Printer, CheckCircle, AlertCircle } from "lucide-react";

export interface PedigreePDFModalProps {
  tree: PedigreeNodeData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PedigreePDFModal({
  tree,
  isOpen,
  onClose,
}: PedigreePDFModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tree || !tree.pigeon) return null;

  const certificateElementId = "printable-pedigree-pdf-view";
  const compactRing = formatCompactRing(tree.pigeon);
  const filename = `Himel-Agro-Pedigree-${compactRing}.pdf`;

  const handleDownloadPdf = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      await exportPedigreeToPdf(certificateElementId, filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to download PDF.");
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
      title="Pedigree Certificate Preview & Download"
      subtitle={`Official Certificate for ${tree.pigeon.id} (${compactRing})`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>A4 Landscape Official Layout</span>
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
              <Printer className="w-4 h-4" /> Print Certificate
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isGenerating}
              onClick={handleDownloadPdf}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" /> Download PDF Certificate
            </Button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="overflow-x-auto max-h-[70vh] p-2 bg-slate-100/60 rounded-xl border border-slate-200">
          <PrintablePedigree tree={tree} id={certificateElementId} />
        </div>
      </div>
    </Modal>
  );
}
