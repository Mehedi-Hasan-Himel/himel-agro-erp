"use client";

import React, { useState, useEffect, use } from "react";
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
  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const p = await getPigeonById(pigeonId);
      setPigeon(p);
      setIsLoading(false);
    }
    load();
  }, [pigeonId]);

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
