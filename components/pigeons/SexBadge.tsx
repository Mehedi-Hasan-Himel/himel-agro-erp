import React from "react";
import { PigeonSex } from "@/types/pigeon";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface SexBadgeProps {
  sex?: PigeonSex;
  className?: string;
  showIcon?: boolean;
}

export function SexBadge({
  sex = "UNKNOWN",
  className,
  showIcon = true,
}: SexBadgeProps) {
  if (sex === "MALE") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200",
          className
        )}
      >
        {showIcon && <span className="font-bold">♂</span>}
        <span>Cock (Male)</span>
      </span>
    );
  }

  if (sex === "FEMALE") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200",
          className
        )}
      >
        {showIcon && <span className="font-bold">♀</span>}
        <span>Hen (Female)</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200",
        className
      )}
    >
      <span>Baby / Unknown</span>
    </span>
  );
}
