"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Plus,
  Feather,
  DollarSign,
  Pill,
  Wheat,
  GitFork,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/Button";

export interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const [greeting, setGreeting] = useState("Good Evening");
  const [currentDateStr, setCurrentDateStr] = useState("25 August 2026");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              {greeting}, Himel
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3" /> Himel Agro Loft
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{currentDateStr}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/pigeons/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Register Pigeon</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>
    </header>
  );
}
