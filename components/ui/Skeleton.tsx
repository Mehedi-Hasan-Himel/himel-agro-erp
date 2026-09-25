import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Base atomic Skeleton component with pulse animation
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/70", className)}
      {...props}
    />
  );
}

/**
 * Skeleton for generic data tables (Pigeon table, Finance ledger, Breeding pairs, etc.)
 */
export function TableSkeleton({
  rows = 6,
  columns = 6,
  showHeader = true,
  className,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden", className)}>
      {/* Top filter / search bar placeholder */}
      {showHeader && (
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-48 sm:w-64 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <Skeleton className="h-3.5 w-16 sm:w-24 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/40">
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="py-3.5 px-4">
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                        <Skeleton className="h-4 w-20 sm:w-28 rounded" />
                      </div>
                    ) : cIdx === columns - 1 ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </div>
                    ) : (
                      <Skeleton
                        className={cn(
                          "h-3.5 rounded",
                          cIdx % 2 === 0 ? "w-14 sm:w-20" : "w-20 sm:w-28"
                        )}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Skeleton for Card Grids (Pigeon Card Grid, Feed Stock, etc.)
 */
export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col gap-3.5 overflow-hidden"
        >
          {/* Card Header with Ring & Status */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Photo / Visual Placeholder */}
          <Skeleton className="h-32 sm:h-36 w-full rounded-xl" />

          {/* Details lines */}
          <div className="space-y-2 pt-1">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>

          {/* Footer / Meta */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dedicated Skeleton for Pigeon Registry (/pigeons)
 */
export function PigeonRegistrySkeleton({ viewMode = "TABLE" }: { viewMode?: "TABLE" | "GRID" }) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-52 sm:w-64 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-72 sm:w-96 rounded mt-2" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Skeleton className="h-9 w-full sm:w-72 rounded-xl" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Skeleton based on viewMode */}
      {viewMode === "TABLE" ? (
        <TableSkeleton rows={8} columns={7} showHeader={false} />
      ) : (
        <CardGridSkeleton count={8} />
      )}
    </div>
  );
}

/**
 * Dedicated Skeleton for Individual Pigeon Profile (/pigeons/[id])
 */
export function PigeonProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded" />
        <span className="text-slate-300">/</span>
        <Skeleton className="h-4 w-28 rounded" />
      </div>

      {/* Hero Profile Banner Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Pigeon Avatar Placeholder */}
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Skeleton className="h-7 w-32 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3.5 w-64 rounded" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Skeleton className="h-9 w-24 rounded-xl flex-1 sm:flex-none" />
            <Skeleton className="h-9 w-28 rounded-xl flex-1 sm:flex-none" />
          </div>
        </div>

        {/* Quick KPI stats under banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 space-y-1.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Profile Body Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated Skeleton for Dashboard (/dashboard)
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-7 sm:space-y-8">
      {/* Top Welcome Banner Skeleton */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-800/40 shrink-0" />
            <div className="space-y-2.5">
              <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 rounded-lg bg-emerald-800/40" />
              <Skeleton className="h-4 w-60 sm:w-80 rounded bg-emerald-800/30" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-xl bg-emerald-800/40" />
            <Skeleton className="h-10 w-36 rounded-xl bg-emerald-800/40" />
          </div>
        </div>
      </div>

      {/* KPI Cards Row (4 Stat Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Flock Registry Table Widget */}
        <div className="lg:col-span-2">
          <TableSkeleton rows={6} columns={5} />
        </div>

        {/* Right Column: Quick Action & Breeding Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="grid grid-cols-2 gap-2.5">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated Skeleton for Finance (/finance)
 */
export function FinanceSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <Skeleton className="h-7 w-52 sm:w-64 rounded-lg" />
          <Skeleton className="h-3.5 w-72 rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2"
          >
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Transaction Table Skeleton */}
      <TableSkeleton rows={7} columns={6} />
    </div>
  );
}

/**
 * Dedicated Skeleton for Breeding (/breeding and /breeding/pairs)
 */
export function BreedingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <Skeleton className="h-7 w-60 rounded-lg" />
          <Skeleton className="h-3.5 w-80 rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2"
          >
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>

      {/* Pairs Table Skeleton */}
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}

/**
 * Dedicated Skeleton for Health & Medicine (/health)
 */
export function HealthSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-3.5 w-80 rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-40 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Health Table Skeleton */}
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}

/**
 * Dedicated Skeleton for Feed & Inventory (/feed)
 */
export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-56 rounded-lg" />
          <Skeleton className="h-3.5 w-72 rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Feed Cards Grid */}
      <CardGridSkeleton count={4} />
    </div>
  );
}

/**
 * Dedicated Skeleton for Form Pages (Edit Pigeon, New Pigeon, etc.)
 */
export function FormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated Skeleton for Pedigree Tree Page (/pigeons/[id]/pedigree)
 */
export function PedigreeTreeSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Pedigree Chart Canvas Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs overflow-x-auto min-h-[500px] flex items-center justify-center">
        <div className="flex items-center gap-12 sm:gap-16 w-full max-w-5xl justify-around">
          {/* Target Bird (Gen 1) */}
          <div className="w-56 p-4 rounded-2xl border border-slate-200 space-y-3 shrink-0">
            <Skeleton className="h-6 w-28 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>

          {/* Parents (Gen 2) */}
          <div className="flex flex-col gap-12 shrink-0">
            <div className="w-56 p-4 rounded-2xl border border-slate-200 space-y-3">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <div className="w-56 p-4 rounded-2xl border border-slate-200 space-y-3">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>

          {/* Grandparents (Gen 3) */}
          <div className="flex flex-col gap-6 shrink-0 hidden md:flex">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-52 p-3 rounded-2xl border border-slate-200 space-y-2">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
