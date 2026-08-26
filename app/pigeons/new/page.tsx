"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PigeonForm } from "@/components/pigeons/PigeonForm";

function NewPigeonContent() {
  const searchParams = useSearchParams();
  const defaultFatherId = searchParams.get("fatherId") || "";
  const defaultMotherId = searchParams.get("motherId") || "";
  const defaultHatchDate = searchParams.get("hatchDate") || "";

  return (
    <PigeonForm
      isEdit={false}
      defaultFatherId={defaultFatherId}
      defaultMotherId={defaultMotherId}
      defaultHatchDate={defaultHatchDate}
    />
  );
}

export default function NewPigeonPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-400">
          Loading registration form...
        </div>
      }
    >
      <NewPigeonContent />
    </Suspense>
  );
}
