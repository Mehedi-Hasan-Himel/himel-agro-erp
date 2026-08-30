"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onChange(tabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onChange(tabs[prevIndex].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(tabs[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(tabs[tabs.length - 1].id);
    }
  };

  return (
    <div className={cn("border-b border-slate-200", className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex gap-2 overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "group inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-t-xl",
                isActive
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-emerald-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "ml-1 text-xs px-2 py-0.5 rounded-full font-medium",
                    isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
