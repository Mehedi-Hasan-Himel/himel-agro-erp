<div align="center">

# 🕊️ Himel Agro ERP
### Enterprise Pigeon Farm & Loft Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-emerald?style=for-the-badge)](LICENSE)

**A specialized, full-lifecycle Pigeon Farm ERP engineered for bloodline genealogy, multi-generational pedigree tracking, breeding round optimization, flock health schedules, feed inventory, and financial accounting.**

[Features](#-key-features) • [System Architecture](#-project-structure) • [Ring Specification](#-ring-number-specification) • [Getting Started](#-getting-started) • [Contact](#-loft-contact)

---

</div>

## 📌 Overview

**Himel Agro ERP** is built to address the unique challenges of professional pigeon breeders and racing fanciers. From managing high-flyer lines (such as *Giribaz*) to maintaining tamper-proof genealogy and commercial sale records, Himel Agro ERP digitizes entire loft operations with modern web performance, responsive UI design, and automated PDF pedigree certificates.

---

## 🚀 Key Features

### 1. 🕊️ Pigeon Flock Registry & Organic Grid
- **Dynamic Unique ID**: Prominent identifiers for every bird (e.g., `2026-01-G`).
- **Reformed Physical Ring Format**: Green ring badge displaying `YYYY | SS | Farm | Contact` (e.g., `2026 | 01 | Himel Agro | 01560059954`).
- **Responsive Organic Grid View**:
  - 16:10 visual hero media banner with smooth hover zoom.
  - Quick floating badges for sex, status, active breeding pair, and asking price (`৳`).
  - Spec microgrid displaying Hatch Date, live calculated Age, Clutch ID, and Line Origin.
  - Gender-coded Sire & Dam cards linking directly to biological parent profiles.
  - Multi-breakpoint responsive grid layout (`1 col` mobile → `4 cols` 2XL displays).
- **Tabular Registry**: Density-controlled table with multi-select bulk operations and CSV export readiness.
- **Real-Time Search & Filtering**: Filter by Hatch Year, Breed, Status (Active, For Sale, Sold, Dead, Lost), Sex, or query by any ring, serial, or clutch keyword.

### 2. 🧬 Biological Family & Relationship System
- **Deterministic Traversal Engine**: Computes authentic multi-generational relationships from authoritative `fatherId` and `motherId`:
  - **Parents**: Biological Sire (Father) & Dam (Mother).
  - **Twin Siblings**: Pigeons sharing the same parents, birth date, and clutch.
  - **Full Siblings**: Pigeons sharing the same parents from different clutches/dates.
  - **Half-Siblings**: Maternal (same Dam) and Paternal (same Sire) half-siblings.
  - **Extended Bloodline**: Children, Grandchildren, Grandparents, Uncles, Aunts, Nephews, Nieces, and Cousins.
- **Dedicated Family UI**: View direct biological kin in both the profile Overview and dedicated Family tab.

### 3. 📜 Official Pedigree & PDF Dossier Engine
- **Visual Pedigree Bloodline Tree**: Multi-generation interactive lineage chart tracing ancestors back through generations.
- **1-Click Official Pedigree PDF**: Exports an official landscape A4 bloodline certificate with certified seals and ancestor performance notes.
- **1-Click Pigeon Info PDF**: Generates a comprehensive portrait A4 dossier covering identification, full family lineage summary, breeding stats, health logs, and authorized loft master signature area.

### 4. 📹 Multimedia Showcase
- **Photo Gallery**: High-resolution image uploads with responsive thumbnails and lightbox preview.
- **Video Showcase**: Embed video links directly (YouTube standard links, Shorts, Facebook video, and direct MP4/WebM files) with an in-app player modal.

### 5. 🥚 Breeding Center & Pair Management
- **Pair Formation**: Manage active and past breeding pairs with cage numbers and mating dates.
- **Breeding Rounds Tracker**: Log egg laying dates, hatch dates, baby pigeon IDs, and automatic hatching success rates (`%`).

### 6. 💊 Health & Medication Protocol
- **Scheduled Treatments**: Track flock-wide preventive medicine (liver tonics, dewormers, multi-vitamins, electrolytes) and custom treatment courses.
- **Daily Due Reminders**: Visual dashboard alerts for medications due today.

### 7. 🌾 Feed & Inventory Control
- **Grain Inventory**: Monitor stock levels for Millet (Bajra), Corn/Maize, Green Peas (Dabli), Mineral Grit, and specialty feeds.
- **Low Stock Threshold Alerts**: Automatic warnings when feed reserves fall below minimum thresholds.

### 8. ৳ Finance & Accounts Ledger
- **Income Records**: Pigeon sales, breeding fees, and commercial transactions.
- **Expense Records**: Feed purchases, ring orders, medications, loft accessories.
- **Monthly Net Profit**: Automated calculation of profit margins (`Income - Expenses`).

---

## 🏗️ Project Structure

```text
himel-agro-erp/
├── app/                              # Next.js App Router
│   ├── api/                          # REST API endpoints (pigeons, breeding, pairs)
│   ├── breeding/                     # Breeding pairs & rounds dashboard
│   ├── dashboard/                    # Primary ERP executive dashboard
│   ├── feed/                         # Feed inventory & alert tracking
│   ├── finance/                      # Financial ledger & income/expense reports
│   ├── health/                       # Health protocol & medicine schedule
│   ├── pigeons/                      # Flock Registry (Table & Organic Grid View)
│   │   ├── [id]/                     # Dynamic Pigeon Profile
│   │   │   ├── edit/                 # Edit pigeon profile
│   │   │   ├── pedigree/             # Standalone interactive pedigree view
│   │   │   └── page.tsx              # Comprehensive profile with tabs
│   │   ├── new/                      # New pigeon registration form
│   │   └── page.tsx                  # Registry list & search/filter interface
│   ├── settings/                     # Loft settings & system configuration
│   ├── layout.tsx                    # Root application layout
│   └── page.tsx                      # Landing redirect to /dashboard
├── components/
│   ├── breeding/                     # Pair forms, round tables, mating cards
│   ├── layout/                       # AppShell, Sidebar, Header, Breadcrumbs
│   ├── pedigree/                     # Pedigree tree, PDF modal, printable templates
│   ├── pigeons/                      # PigeonCard, PigeonGrid, PigeonTable, VideoGallery
│   └── ui/                           # Badges, icons (Cock, Hen, Squab, Taka), SearchInput
├── data/                             # Local database store (JSON fallbacks)
│   ├── pairs.json                    # Breeding pairs and clutch history
│   ├── pigeons.json                  # Flock records & genealogy data
│   └── settings.json                 # Loft branding & farm parameters
├── lib/
│   ├── calculations/                 # Biological relationship & pedigree algorithms
│   ├── config/                       # Site & loft metadata (siteConfig.ts)
│   ├── formatters/                   # Currency (৳), date, and ring formatters
│   ├── pedigree/                     # PDF export engine (jsPDF / html-to-image)
│   └── repositories/                 # Data access layer (JSON & MongoDB sync)
├── types/                            # TypeScript schemas (pigeon, breeding, pedigree)
└── public/                           # Static assets, loft logos, and badges
```

---

## 🏷️ Ring Number Specification

Himel Agro ERP enforces an authoritative, standardized physical ring numbering system:

$$\text{Format:} \quad \mathbf{YYYY \mid SS \mid Farm \mid Contact}$$

| Component | Description | Example |
| :--- | :--- | :--- |
| **YYYY** | Hatch / Registration Year | `2026` |
| **SS** | 2-Digit Ring Serial | `01` |
| **Farm** | Certified Farm Name | `Himel Agro` |
| **Contact** | Official Loft Phone | `01560059954` |

**Rendered Example:**
$$\colorbox{#059669}{\color{white}\texttt{\textbf{ 2026 | 01 | Himel Agro | 01560059954 }}}$$

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime & UI**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/) + Handcrafted Pigeon Vector Icons
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html-to-image](https://github.com/bubkoo/html-to-image)
- **Database**: File-based JSON storage with optional [MongoDB / Mongoose](https://www.mongodb.com/) synchronization

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mehedi-Hasan-Himel/himel-agro-erp.git
   cd himel-agro-erp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env.local` file if you wish to connect to a live MongoDB instance:
   ```env
   MONGODB_URI=mongodb://localhost:27017/himel-agro-erp
   ```
   *(If not set, the system automatically uses the bundled local JSON repository in `data/`).*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Next.js development server with Fast Refresh |
| `npm run build` | Compiles the production build |
| `npm run start` | Launches the compiled production application |
| `npm run lint` | Runs ESLint to inspect code quality |
| `npx tsc --noEmit` | Runs the TypeScript compiler to verify zero type errors |

---

## 📍 Loft Contact

- **Farm Name**: **Himel Agro**
- **Loft Master**: **Mehedi Hasan Himel**
- **Phone / Loft Line**: `+880 1560059954`
- **WhatsApp**: [Chat on WhatsApp (+8801560059954)](https://wa.me/8801560059954)
- **Facebook**: [facebook.com/Himel.Pet.House](https://www.facebook.com/Himel.Pet.House)
- **Location**: [Loft Location on Google Maps](https://maps.app.goo.gl/rxvdsxq8ydnqfEKQ6)

---

<div align="center">
  <p>© 2026 Himel Agro. All rights reserved.</p>
</div>
