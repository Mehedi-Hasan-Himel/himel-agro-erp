"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { PedigreeNodeData } from "@/types/pedigree";
import { getPigeonById } from "@/lib/repositories/pigeonRepository";
import { buildPedigreeTree } from "@/lib/pedigree/pedigreeBuilder";
import { formatRingNumber, formatCompactRing } from "@/lib/formatters/ringFormatter";
import { PedigreeTree } from "@/components/pedigree/PedigreeTree";
import { PedigreePDFModal } from "@/components/pedigree/PedigreePDFModal";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Download, GitFork, Edit, ShieldCheck } from "lucide-react";

export default function DedicatedPedigreePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const pigeonId = resolvedParams.id;

  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [tree, setTree] = useState<PedigreeNodeData | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, pedigree] = await Promise.all([
        getPigeonById(pigeonId),
        buildPedigreeTree(pigeonId, 3),
      ]);
      setPigeon(p);
      setTree(pedigree);
      setIsLoading(false);
    }
    load();
  }, [pigeonId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3" />
        <span>Building Genealogical Bloodline Tree...</span>
      </div>
    );
  }

  if (!pigeon || !tree) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Pedigree Record Not Found
        </h3>
        <Link href="/pigeons">
          <Button variant="primary">Back to Pigeons Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/pigeons/${pigeon.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pigeon Profile
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Genealogical Pedigree Bloodline
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Certified
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            Subject: {formatRingNumber(pigeon)} ({pigeon.breedSubtype || pigeon.breed})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/pigeons/${pigeon.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Edit className="w-3.5 h-3.5" /> Edit Parents / Lineage
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPdfModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Official Pedigree PDF
          </Button>
        </div>
      </div>

      {/* Interactive Tree View */}
      <PedigreeTree tree={tree} />

      {/* Info Card */}
      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex items-start gap-3">
        <GitFork className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold">Dynamic Lineage System</h5>
          <p className="text-emerald-800/80 mt-0.5">
            This pedigree tree is automatically generated from parent ID
            relationships. If you adjust the father or mother on any pigeon
            profile, this bloodline visualizer and official PDF certificates
            will dynamically update in real time.
          </p>
        </div>
      </div>

      {/* PDF Modal */}
      {isPdfModalOpen && (
        <PedigreePDFModal
          tree={tree}
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </div>
  );
}
