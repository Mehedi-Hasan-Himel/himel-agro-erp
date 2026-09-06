"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import {
  LayoutDashboard,
  Feather,
  GitFork,
  HeartHandshake,
  Activity,
  Wheat,
  Settings,
  X,
  PlusCircle,
  MapPin,
} from "lucide-react";
import { TakaIcon } from "../ui/icons";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/pigeons",
    label: "Pigeon Registry",
    icon: Feather,
  },
  {
    href: "/breeding/pairs",
    label: "Breeding Pairs",
    icon: GitFork,
  },
  {
    href: "/breeding",
    label: "Breeding Rounds",
    icon: HeartHandshake,
  },
  {
    href: "/health",
    label: "Health & Medicine",
    icon: Activity,
  },
  {
    href: "/feed",
    label: "Feed & Inventory",
    icon: Wheat,
  },
  {
    href: "/finance",
    label: "Finance & Accounts",
    icon: TakaIcon,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Brand Logo Container */}
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <div className="relative w-full h-full rounded-full flex items-center justify-center bg-emerald-950/90 ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-slate-900 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-all overflow-hidden">
              <Image
                src={SITE_CONFIG.logoUrl}
                alt={`${SITE_CONFIG.farmName} Logo`}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                unoptimized
                priority
                suppressHydrationWarning
              />
            </div>
          </div>
          <div className="overflow-hidden">
            <h1 className="font-black text-white text-sm sm:text-base tracking-tight leading-tight truncate">
              {SITE_CONFIG.farmName}
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
              {SITE_CONFIG.shortName} ERP
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
      <div className="p-3">
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
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-emerald-300" : "text-slate-400"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Social, WhatsApp & Location Quick Links */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="grid grid-cols-3 gap-1">
          <a
            href={SITE_CONFIG.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 text-[10px] font-medium border border-blue-700/40 transition-colors"
            title="Facebook Page"
          >
            <span className="font-bold text-blue-400">f</span>
            <span>FB</span>
          </a>
          <a
            href={SITE_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 text-[10px] font-medium border border-emerald-600/40 transition-colors"
            title={`WhatsApp: ${SITE_CONFIG.whatsappNumber}`}
          >
            <span className="font-bold text-emerald-400">WA</span>
            <span>Chat</span>
          </a>
          <a
            href={SITE_CONFIG.googleMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 transition-colors"
            title="Google Maps Location"
          >
            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
            <span>Map</span>
          </a>
        </div>

        {/* Farm Status Badge Footer */}
        <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300">{SITE_CONFIG.farmName}</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Contact / Loft:</span>
            <a
              href={SITE_CONFIG.telUrl}
              className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold"
            >
              {SITE_CONFIG.contactNumber}
            </a>
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
            <span>WhatsApp:</span>
            <a
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-white hover:underline font-semibold"
            >
              {SITE_CONFIG.whatsappNumber}
            </a>
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
