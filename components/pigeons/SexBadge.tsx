import React from "react";
import { PigeonSex } from "@/types/pigeon";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CockPigeonIcon, HenPigeonIcon, SquabIcon } from "../ui/icons";

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
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200",
          className
        )}
      >
        {showIcon && <CockPigeonIcon className="w-3.5 h-3.5 text-sky-700 shrink-0" />}
        <span>Male</span>
      </span>
    );
  }

  if (sex === "FEMALE") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200",
          className
        )}
      >
        {showIcon && <HenPigeonIcon className="w-3.5 h-3.5 text-pink-700 shrink-0" />}
        <span>Female</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200",
        className
      )}
    >
      {showIcon && <SquabIcon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
      <span>Baby</span>
    </span>
  );
}

export default SexBadge;
