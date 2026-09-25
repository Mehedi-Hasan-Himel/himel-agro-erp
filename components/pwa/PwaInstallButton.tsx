"use client";

import React, { useState } from "react";
import { usePwa } from "./PwaProvider";
import { Download, CheckCircle2, Smartphone, X } from "lucide-react";

export interface PwaInstallButtonProps {
  className?: string;
  variant?: "sidebar" | "banner" | "button";
}

export function PwaInstallButton({ className = "", variant = "sidebar" }: PwaInstallButtonProps) {
  const { isInstallable, isInstalled, promptInstall } = usePwa();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  // Detect iOS Safari
  const isIos =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  if (isInstalled) {
    if (variant === "sidebar") {
      return (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PWA Installed</span>
          </div>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
            App
          </span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await promptInstall();
      setIsInstalling(false);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  // If not installable and not iOS, don't clutter the UI
  if (!isInstallable && !isIos) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs group ${
          variant === "sidebar"
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/30"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        } ${className}`}
        title="Install Himel Agro ERP app to your device home screen"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-white/20 text-white group-hover:scale-110 transition-transform">
            <Download className={`w-3.5 h-3.5 ${isInstalling ? "animate-bounce" : ""}`} />
          </div>
          <div className="text-left truncate">
            <p className="leading-tight truncate">Install App</p>
            <p className="text-[9px] font-normal text-emerald-100 opacity-90 truncate">
              Desktop & Mobile PWA
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white shrink-0 ml-1">
          Install
        </span>
      </button>

      {/* iOS Safari Home Screen Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>Install on iPhone / iPad</span>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              <p>To install this app on iOS Safari:</p>
              <ol className="list-decimal pl-5 space-y-1.5 font-medium text-slate-700">
                <li>
                  Tap the <strong className="text-slate-900">Share</strong> button (box with upward arrow) at the bottom of Safari.
                </li>
                <li>
                  Scroll down and tap <strong className="text-slate-900">Add to Home Screen</strong>.
                </li>
                <li>
                  Tap <strong className="text-emerald-700">Add</strong> at the top right to complete.
                </li>
              </ol>
            </div>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
