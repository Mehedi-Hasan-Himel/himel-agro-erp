import React from "react";
import Link from "next/link";
import { formatCompactRing, formatRingNumber, RingIdentifiable } from "@/lib/formatters/ringFormatter";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface RingBadgeProps {
  pigeon?: (RingIdentifiable & { id?: string }) | null;
  full?: boolean;
  clickable?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function RingBadge({
  pigeon,
  full = false,
  clickable = true,
  className,
  size = "md",
}: RingBadgeProps) {
  if (!pigeon) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-500">
        Unknown
      </span>
    );
  }

  const text = full ? formatRingNumber(pigeon) : formatCompactRing(pigeon);
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 tracking-tight",
    md: "text-xs px-2.5 py-1 font-semibold",
    lg: "text-sm px-3.5 py-1.5 font-bold tracking-wide",
  };

  const badgeContent = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-mono font-medium transition-all shadow-2xs",
        full
          ? "bg-slate-900 text-emerald-400 border border-slate-700"
          : "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100",
        sizeClasses[size],
        clickable && pigeon.id && "cursor-pointer hover:shadow-xs",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      <span>{text}</span>
    </span>
  );

  if (clickable && pigeon.id) {
    return (
      <Link href={`/pigeons/${pigeon.id}`} className="inline-flex shrink-0">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
