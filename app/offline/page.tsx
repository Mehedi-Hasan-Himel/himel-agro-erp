"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import { WifiOff, RotateCcw, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Icon Container */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            <WifiOff className="w-10 h-10 text-emerald-600" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            You're Currently Offline
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {SITE_CONFIG.farmName} ERP is running in offline mode. Cached records and features remain accessible, but network requests cannot be processed right now.
          </p>
        </div>

        {/* Quick Offline Status Badge */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-1">
            Offline Capabilities
          </p>
          <p>
            You can still navigate through previously loaded pigeon profiles, pedigree charts, and records cached on your device.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleReload}
            className="w-full sm:w-auto gap-2 text-xs font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Connection</span>
          </Button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
