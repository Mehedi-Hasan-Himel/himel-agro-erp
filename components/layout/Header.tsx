"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import {
  Menu,
  Plus,
  Calendar,
  Sparkles,
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
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          {/* Radiant Green Light Logo Container */}
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.5)] overflow-hidden shrink-0 flex items-center justify-center">
            <Image
              src={SITE_CONFIG.logoUrl}
              alt={SITE_CONFIG.farmName}
              width={160}
              height={160}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                {greeting}, {SITE_CONFIG.ownerName}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                <Sparkles className="w-3 h-3" /> {SITE_CONFIG.farmName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{currentDateStr}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Direct Call & WhatsApp & Facebook & Maps links */}
        <a
          href={SITE_CONFIG.telUrl}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200/80 transition-colors"
          title={`Call: ${SITE_CONFIG.contactNumber}`}
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-mono">{SITE_CONFIG.contactNumber}</span>
        </a>

        <a
          href={SITE_CONFIG.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors"
          title={`Chat on WhatsApp: ${SITE_CONFIG.whatsappNumber}`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
          <ExternalLink className="w-3 h-3 text-emerald-500" />
        </a>

        <a
          href={SITE_CONFIG.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
          title="Visit Facebook Page"
        >
          <span className="font-black text-blue-600">f</span>
          <span>Facebook</span>
          <ExternalLink className="w-3 h-3 text-blue-500" />
        </a>

        <a
          href={SITE_CONFIG.googleMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
          title="View Loft Location on Google Maps"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Location</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

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
