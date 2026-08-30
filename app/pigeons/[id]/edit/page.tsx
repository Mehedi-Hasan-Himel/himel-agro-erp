"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Pigeon } from "@/types/pigeon";
import { getPigeonById } from "@/lib/repositories/pigeonRepository";
import { PigeonForm } from "@/components/pigeons/PigeonForm";

export default function EditPigeonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const pigeonId = resolvedParams.id;
  const router = useRouter();

  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const p = await getPigeonById(pigeonId);
      if (p && p.id && p.id.toLowerCase() !== pigeonId.toLowerCase()) {
        // Auto-redirect URL to canonical format (e.g. 2026-01 -> 2026-01-g)
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/pigeons/${p.id}/edit`);
        }
        router.replace(`/pigeons/${p.id}/edit`);
        return;
      }
      setPigeon(p);
      setIsLoading(false);
    }
    load();
  }, [pigeonId, router]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading pigeon for editing...
      </div>
    );
  }

  if (!pigeon) {
    return (
      <div className="py-20 text-center text-slate-500">
        Pigeon record not found.
      </div>
    );
  }

  return <PigeonForm initialPigeon={pigeon} isEdit={true} />;
}
