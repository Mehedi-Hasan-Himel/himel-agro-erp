import React from "react";
import { PigeonStatus } from "@/types/pigeon";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface StatusBadgeProps {
  status?: PigeonStatus;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status = "ACTIVE",
  className,
  size = "md",
}: StatusBadgeProps) {
  const configs: Record<
    PigeonStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    ACTIVE: {
      label: "Active",
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    SOLD: {
      label: "Sold",
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
      dot: "bg-blue-500",
    },
    DEAD: {
      label: "Dead",
      bg: "bg-rose-50 border-rose-200",
      text: "text-rose-700",
      dot: "bg-rose-500",
    },
    LOST: {
      label: "Lost",
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
  };

  const config = configs[status] || configs.ACTIVE;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide uppercase",
        config.bg,
        config.text,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
