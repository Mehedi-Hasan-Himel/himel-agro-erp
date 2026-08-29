"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import {
  Menu,
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  Phone,
  MessageCircle,
} from "lucide-react";

export interface HeaderProps {
  onMenuToggle: () => void;
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [greeting, setGreeting] = useState<string>("Welcome");
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setGreeting(getGreeting(now.getHours()));
    setCurrentDateStr(
      now.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs w-full max-w-full min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Radiant Green Light Logo Container */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 ring-2 ring-emerald-500 shadow-sm shadow-emerald-500/40 overflow-hidden shrink-0 flex items-center justify-center">
            <Image
              src={SITE_CONFIG.logoUrl}
              alt={SITE_CONFIG.farmName}
              width={160}
              height={160}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {greeting}, {SITE_CONFIG.ownerName}
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs shrink-0">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>{SITE_CONFIG.farmName}</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-600 flex items-center gap-1.5 truncate font-medium">
              <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{currentDateStr}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Direct Call */}
        <a
          href={SITE_CONFIG.telUrl}
          className="inline-flex items-center gap-1 sm:gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-300/80 transition-colors shrink-0"
          title={`Call Loft: ${SITE_CONFIG.contactNumber}`}
        >
          <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="hidden sm:inline font-mono">{SITE_CONFIG.contactNumber}</span>
        </a>

        {/* WhatsApp */}
        <a
          href={SITE_CONFIG.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 transition-colors shrink-0"
          title={`WhatsApp: ${SITE_CONFIG.whatsappNumber}`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="hidden sm:inline">WhatsApp</span>
          <ExternalLink className="hidden sm:inline w-3 h-3 text-emerald-700" />
        </a>

        {/* Facebook (tablet+) */}
        <a
          href={SITE_CONFIG.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-300 transition-colors shrink-0"
          title="Visit Facebook Page"
        >
          <span className="font-black text-blue-700">f</span>
          <span>Facebook</span>
          <ExternalLink className="w-3 h-3 text-blue-700" />
        </a>

        {/* Location (desktop+) */}
        <a
          href={SITE_CONFIG.googleMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-300 transition-colors shrink-0"
          title="View Loft Location on Google Maps"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          <span>Location</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        {/* Register Pigeon */}
        <Link
          href="/pigeons/new"
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Register Pigeon</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>
    </header>
  );
}
