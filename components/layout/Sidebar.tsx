"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Feather,
  GitFork,
  Wheat,
  Pill,
  DollarSign,
  Settings,
  PlusCircle,
  X,
  HeartHandshake,
} from "lucide-react";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pigeons",
    href: "/pigeons",
    icon: Feather,
  },
  {
    label: "Breeding Overview",
    href: "/breeding",
    icon: HeartHandshake,
  },
  {
    label: "Breeding Pairs",
    href: "/breeding/pairs",
    icon: GitFork,
  },
  {
    label: "Feed & Inventory",
    href: "/feed",
    icon: Wheat,
  },
  {
    label: "Health & Medicine",
    href: "/health",
    icon: Pill,
  },
  {
    label: "Farm Finance",
    href: "/finance",
    icon: DollarSign,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md ring-2 ring-emerald-500/30">
            HA
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">
              Himel Agro
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-400">
              Pigeon Farm ERP
            </p>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <Link
          href="/pigeons/new"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs tracking-wide shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Pigeon</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-emerald-400" : "text-slate-400"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Farm Status Badge Footer */}
      <div className="p-4 border-t border-slate-800 text-xs">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300">Himel Agro Loft</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400">
            Owner: Himel • Contact: 01969038472
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
            <span>MVP v1.0 • BDT (৳)</span>
            <span>40+ Birds</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
