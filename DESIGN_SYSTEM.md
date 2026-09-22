# Himel's Pet House ERP — Typography & Design System Guidelines

This document defines the unified typography, color scale, component hierarchy, and layout standards across the entire Himel's Pet House ERP application. All existing and new UI components must strictly adhere to these guidelines.

---

## 1. Typography & Font System

### Font Families
- **Primary Sans (`var(--font-geist-sans)`, `font-sans`)**: 
  - Used for all UI interfaces, headings, navigation, descriptions, buttons, and form labels.
  - Rendered with `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`.
- **Data Mono (`var(--font-geist-mono)`, `font-mono`)**: 
  - Used for all unique identifiers, official ring numbers (`2026 | 01 | Himel's Pet House | 01560059954`), Pair IDs, Clutch IDs, financial figures, and serial codes.

### Type Scale & Hierarchy

| Role | Class | Size / Line-Height | Font Weight | Letter Spacing | Target Elements |
|---|---|---|---|---|---|
| **Display Hero** | `text-2xl sm:text-3xl` | `24px / 30px` (sm: `30px / 36px`) | `font-black` (900) or `font-extrabold` (800) | `tracking-tight` (`-0.025em`) | Pigeon Identity Names, Main KPI Totals |
| **Page Title (H1)** | `text-2xl font-extrabold` | `24px / 32px` | `font-extrabold` (800) | `tracking-tight` (`-0.02em`) | Top Page Headings (`Pigeon Registry`, `Breeding Center`) |
| **Modal / Section Title (H2)** | `text-lg font-bold` | `18px / 26px` | `font-bold` (700) | `tracking-tight` (`-0.015em`) | Modal Dialog Titles, Major Section Dividers |
| **Card Header (H3)** | `text-base font-bold` | `16px / 24px` | `font-bold` (700) | `tracking-tight` (`-0.01em`) | Card Titles (`CardTitle`), Table Card Headers |
| **Body Primary** | `text-sm` | `14px / 20px` | `font-medium` (500) or `font-normal` (400) | Normal | Primary descriptive copy, table row values, inputs |
| **Secondary / Meta** | `text-xs` | `12px / 16px` | `font-medium` (500) | Normal | Dates, breeds, secondary table cells, helper texts |
| **Category / Group Label** | `text-[10px] sm:text-[11px]` | `10px–11px` | `font-bold` (700) | `uppercase tracking-wider` (`+0.05em`) | Fieldset categories, card labels (`Biological Father`, `Partner`) |
| **Micro Badges** | `text-[10px]` | `10px / 14px` | `font-bold` (700) | `uppercase tracking-wide` | Status pills, sex pills, count pills |

---

## 2. Color Palette & Contrast Guidelines (WCAG AAA)

### Text Contrast
- **Primary Text**: `text-slate-900` (`#0f172a`) — For main titles, IDs, active card names.
- **Secondary Text**: `text-slate-700` (`#334155`) — For body copy, form labels, emphasized data.
- **Muted Text**: `text-slate-500` (`#64748b`) — For timestamps, secondary details, dates, unit labels.
- **Subtle Text**: `text-slate-400` (`#94a3b8`) — For placeholders, disabled states, unassigned lineage.

### Brand Palette (Emerald Luxury)
- **Primary 600**: `bg-emerald-600 hover:bg-emerald-700` (`#059669`) — Primary buttons, brand accents.
- **Surface 50**: `bg-emerald-50/50 border-emerald-100 text-emerald-800` — Highlighting active pairs & breeding.

### Domain-Specific Lineage Tokens
- **Sire (Father Cock)**: `bg-sky-50 text-sky-700 border-sky-200` with `CockPigeonIcon`.
- **Dam (Mother Hen)**: `bg-pink-50 text-pink-700 border-pink-200` with `HenPigeonIcon`.
- **Pair (Breeding Unit)**: `bg-emerald-50 text-emerald-800 border-emerald-200` with `Heart` / `GitFork`.
- **Squab (Young / Offspring)**: `bg-emerald-50 text-emerald-700` with `SquabIcon`.

### Pigeon Lifecycle Status Tokens
- **ACTIVE**: `bg-emerald-50 text-emerald-700 border-emerald-200` + emerald dot (`bg-emerald-500`).
- **SOLD**: `bg-blue-50 text-blue-700 border-blue-200` + blue dot (`bg-blue-500`).
- **DEAD**: `bg-rose-50 text-rose-700 border-rose-200` + rose dot (`bg-rose-500`).
- **LOST**: `bg-amber-50 text-amber-700 border-amber-200` + amber dot (`bg-amber-500`).

---

## 3. Component Design Guidelines

### 1. Cards
- **Base Style**: `bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs`.
- **Header**: `px-6 py-4 border-b border-slate-100 flex items-center justify-between`.
- **Content**: `p-6` with standard `space-y-4` or `space-y-6`.

### 2. Form Inputs & Selects
- **Label**:
  ```tsx
  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
    Label Text {required && <span className="text-rose-600 font-black">*</span>}
  </label>
  ```
- **Input Field**:
  - `w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25`
- **Helper / Error Text**:
  - Normal: `text-xs text-slate-500 font-medium`
  - Error: `text-xs text-rose-600 font-semibold`

### 3. Buttons
- **Primary**: `bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs` (or `bg-emerald-600 hover:bg-emerald-700 text-white`).
- **Secondary / Outline**: `bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs`.
- **Ghost**: `text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs px-3 py-1.5 rounded-xl`.
- **Action Group Alignment**:
  - Action button rows must use `flex flex-wrap items-center gap-2`.
  - In hero/header cards, use `xl:items-start xl:justify-end` so buttons align along the top baseline rather than vertically floating in the center of the card.

### 4. Modals
- **Backdrop**: `bg-slate-900/60 backdrop-blur-xs`.
- **Dialog Box**: `rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col`.
- **Header**: `px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between`.
- **Footer**: `px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2`.

---

## 4. Layout & Spacing Standards
- **Page Container Spacing**: `space-y-6` between major page blocks.
- **Grid Layouts**:
  - Primary / Sidebar split: `grid grid-cols-1 lg:grid-cols-3 gap-6` (2 columns main, 1 column sidebar).
  - Stat Cards: `grid grid-cols-2 lg:grid-cols-4 gap-4`.
  - Form field grids: `grid grid-cols-1 sm:grid-cols-2 gap-4`.
- **Border Radius Standards**:
  - Modals & Cards: `rounded-2xl` (outermost cards: `rounded-3xl`).
  - Inputs, Buttons, & Media Avatars: `rounded-xl`.
  - Badges & Pills: `rounded-full` or `rounded-lg`.
