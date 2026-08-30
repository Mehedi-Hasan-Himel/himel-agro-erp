"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search pigeons, ring, breed...",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search text"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:text-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
