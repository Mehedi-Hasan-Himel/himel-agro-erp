<div align="center">

# 🕊️ Himel's Pet House ERP
### Enterprise Pigeon Farm & Loft Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://himel-agro-erp.vercel.app)
[![Google Sheets](https://img.shields.io/badge/Google_Sheets-2--Way_Sync-34A853?style=for-the-badge&logo=googlesheets)](https://script.google.com)

**An enterprise-grade, full-lifecycle Pigeon Farm ERP engineered for bloodline genealogy, multi-generational pedigree tracking, real-time bidirectional Google Sheets synchronization, breeding optimization, flock health schedules, feed inventory, and financial accounting.**

[Live Production](https://himel-agro-erp.vercel.app) • [Key Features](#-key-features) • [Google Sheets Sync](#-2-way-google-sheets-sync-engine) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Contact](#-loft-contact)

---

</div>

## 📌 Overview

**Himel's Pet House ERP** is a full-featured management platform custom-built for professional pigeon fanciers and commercial breeders. From managing high-flyer bloodlines (such as *Giribaz* and *Racing Homers*) to tracking tamper-proof genealogy, physical ring records, and real-time ledger accounting, this ERP digitizes every facet of loft operations.

The system features **2-way real-time Google Sheets synchronization** (full CRUD support with bidirectional deletion), **instant PDF pedigree dossiers**, **dynamic biological relationship calculation**, and a **responsive Skeleton UI**.

---

## 🚀 Key Features

### 1. 🕊️ Pigeon Flock Registry & Quick Category Filter
- **Multi-Category Quick Selector**:
  - Filter pigeons instantly by **All**, **Male**, **Female**, **Baby**, and **Lost** with live real-time count badges.
  - Standardized terminology: biological sexes are strictly **Male (Cock)**, **Female (Hen)**, and **Baby (Squab)**.
  - Dedicated **Lost** category displays birds marked as Lost or with notes indicating a lost ring.
- **Physical Ring Numbering Standard**:
  - Prominent badge showing `YYYY | SS | Farm | Contact` (e.g., `2026 | 01 | Himel's Pet House | 01560059954`).
  - Canonical identifier generation (e.g., `2026-01-GS-M`).
- **Dual Display Modes**:
  - **Organic Grid View**: 16:10 visual hero cards with hover zoom, quick action menus, floating status badges, biological Sire & Dam links, and sale pricing.
  - **Tabular Registry**: Density-controlled table with sorting, multi-select bulk deletion, and quick status actions.
- **Search & Multi-Filter Toolbar**: Filter by Hatch Year, Breed, Status (Active, Available for Sale, Sold, Dead, Lost), Category, or free text search across ring numbers, parents, and notes.

### 2. ⚡ Bidirectional Real-Time Google Sheets Sync
- **2-Way Real-Time CRUD Engine**:
  - **Create**: Registering a pigeon or logging an income/expense in the ERP pushes a new row to Google Sheets instantly.
  - **Update**: Editing details (breed, color, status, parents, prices) updates the corresponding row in Google Sheets via Google Apps Script.
  - **Delete**: Deleting records from the ERP removes them from Google Sheets (`DELETE_PIGEON` / `DELETE_TRANSACTION`).
  - **Remote Deletion Reconciliation**: If a record is deleted directly inside the Google Sheet, the ERP automatically purges it from the local JSON store and MongoDB upon sync.
- **Auto-Sync & Manual Triggers**:
  - Background polling hook keeps the UI synchronized.
  - 1-click manual **Sync Sheet** button in the navigation header with detailed status notifications (added, updated, removed counts).
  - Webhook endpoint (`/api/sync/google-sheets/push`) allows Google Sheets edit triggers to notify the ERP immediately.

### 3. 🧬 Biological Family & Pedigree Genealogy Engine
- **Deterministic Kinship Traversal**: Computes relationships using biological `fatherId` and `motherId`:
  - **Direct Parents**: Biological Sire (Father) and Dam (Mother).
  - **Siblings**: Full brothers/sisters (same parents) and half-siblings (shared Sire or shared Dam).
  - **Twin Siblings**: Pigeons sharing identical parents, birth date, and clutch identifier.
  - **Extended Bloodline**: Grandparents, Grandchildren, Uncles, Aunts, Nephews, Nieces, and Cousins.
- **Interactive Lineage Tree**: Multi-generational visual pedigree view.
- **Official PDF Generation**:
  - **Landscape Pedigree Certificate**: Official A4 pedigree document with certified loft seal and ancestor performance traits.
  - **Portrait Comprehensive Dossier**: Full profile sheet containing physical metrics, family bloodline summary, health log, and loft master signature line.

### 4. 🥚 Breeding Center & Pair Management
- **Pair Mating**: Pair active Cocks and Hens with designated cage/loft numbers and pairing dates.
- **Breeding Rounds Tracker**: Track clutches, egg laying dates, fertility, hatch dates, ring banding, and automated hatch rate calculations (`%`).

### 5. 💊 Health & Medication Protocol
- **Treatment Courses**: Plan preventive vaccines, dewormers, multi-vitamins, and antibiotic treatments.
- **Daily Due Reminders**: Visual alerts on the dashboard when treatments or booster doses are scheduled for today.

### 6. 🌾 Feed Inventory & Stock Control
- **Grain Stock Monitoring**: Track grain varieties (Millet/Bajra, Maize/Corn, Green Peas/Dabli, Wheat, Mineral Grit).
- **Low Stock Threshold Warnings**: Dynamic warnings when grain reserves dip below minimum reorder levels.

### 7. ৳ Finance & Accounts Ledger
- **Income & Expense Tracking**: Pigeon sales, breeding services, grain purchases, ring orders, and accessories.
- **Automated Profit Metrics**: Real-time calculation of Total Income, Total Expenses, and Net Margin (`৳`).
- **Synchronized with Google Sheets**: Ledger transactions mirror the Google Sheet finance tab.

### 8. ⚡ Responsive Skeleton UI
- Built with animated Tailwind CSS skeletons across all major views (**Dashboard**, **Pigeons Registry**, **Profile**, **Breeding**, **Health**, **Feed**, and **Finance**).
- Zero layout shifting or blank screen states during initial loads or sheet re-synchronizations.

---

## 📊 System Architecture

```text
himel-agro-erp/
├── app/                              # Next.js App Router (Turbopack)
│   ├── api/                          # REST API Routes
│   │   ├── breeding-rounds/          # Breeding rounds CRUD
│   │   ├── dashboard/                # Live metrics & counts endpoint
│   │   ├── feed-purchases/           # Feed purchase log
│   │   ├── feed-usage/               # Daily grain consumption
│   │   ├── flying-records/           # High-flyer flight logs
│   │   ├── health-records/           # Disease & treatment logs
│   │   ├── medicine-schedules/       # Medication calendar & reminders
│   │   ├── pairs/                    # Active & past breeding pairs
│   │   ├── pigeons/                  # Pigeon Registry API (with live sheet reconciliation)
│   │   ├── sync/google-sheets/       # Google Sheets sync triggers & push webhooks
│   │   └── transactions/             # Financial accounting ledger API
│   ├── breeding/                     # Breeding pairs & clutch management UI
│   ├── dashboard/                    # Executive overview & active flock widgets
│   ├── feed/                         # Feed inventory tracker
│   ├── finance/                      # Income & expense ledger
│   ├── health/                       # Health schedules & vaccination logs
│   ├── pigeons/                      # Flock Registry (Table & Organic Grid View)
│   │   ├── [id]/                     # Dynamic Pigeon Profile & Family Tree
│   │   │   ├── edit/                 # Pigeon Edit Form
│   │   │   └── pedigree/             # Standalone interactive pedigree certificate
│   │   ├── new/                      # New Pigeon Registration Form
│   │   └── page.tsx                  # Registry with Category (All, Male, Female, Baby, Lost)
│   ├── settings/                     # Loft settings & Google Sheets integration config
│   ├── layout.tsx                    # Root AppShell & layout wrapper
│   └── page.tsx                      # Root redirect to /dashboard
├── components/
│   ├── breeding/                     # PairFormModal, BreedingRoundTable
│   ├── dashboard/                    # LiveFlockRegistryWidget, FinancialSummary
│   ├── layout/                       # Sidebar, Header, Breadcrumbs, Navigation
│   ├── pedigree/                     # PedigreeNode, PrintablePedigree, PedigreePDFModal
│   ├── pigeons/                      # PigeonTable, PigeonGrid, PigeonCard, SexBadge, StatusBadge
│   └── ui/                           # Skeleton, SearchInput, Custom Icons (Cock, Hen, Squab, Taka)
├── data/                             # File-based JSON fallback repository
│   ├── pairs.json                    # Breeding pair data snapshot
│   ├── pigeons.json                  # Active flock registry snapshot
│   ├── settings.json                 # Loft configuration snapshot
│   └── transactions.json             # Financial records snapshot
├── lib/
│   ├── calculations/                 # Kinship calculator & flock statistics
│   ├── config/                       # Loft branding & site metadata
│   ├── formatters/                   # Currency (৳), date, and physical ring formatters
│   ├── hooks/                        # useGoogleSheetSync (auto-polling & sync triggers)
│   ├── pedigree/                     # jsPDF & HTML canvas export engines
│   ├── repositories/                 # Storage adapter (MongoDB + Local JSON Fallback)
│   └── services/                     # Google Sheets sync & push services
└── types/                            # TypeScript interfaces & domain types
```

---

## 🔄 2-Way Google Sheets Sync Engine

The ERP connects to a Google Sheets workbook via an authoritative Google Apps Script web app endpoint:

| Action | HTTP Method | Payload / Response |
| :--- | :--- | :--- |
| **Fetch & Reconcile** | `GET` | Pulls all rows, parses columns (rings, breeds, sex, status), and purges ERP records missing from Sheet. |
| **Insert Pigeon** | `POST` | `{ action: "INSERT_PIGEON", ringNumber, breed, gender, status, notes, ... }` |
| **Update Pigeon** | `POST` | `{ action: "UPDATE_PIGEON", ringNumber, breed, gender, status, notes, ... }` |
| **Delete Pigeon** | `POST` | `{ action: "DELETE_PIGEON", ringNumber: "01--2026" }` |
| **Insert Transaction**| `POST` | `{ action: "INSERT_TRANSACTION", type: "SELL", amount: 1500, ... }` |
| **Delete Transaction**| `POST` | `{ action: "DELETE_TRANSACTION", id: "txn_123" }` |

### Environment Variables
Configure your `.env.local` to connect Google Sheets and MongoDB:

```env
# Google Apps Script Web App Deployment URL
NEXT_PUBLIC_GOOGLE_SHEETS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbzU4871CsSjuimWX2oRG5pqpgWokFsK4Hhjd6EPr6YcsOwVA-knV9fexscWrRO-eofLTg/exec"

# Target Google Spreadsheet URL (Pigeons & Finance Ledger)
NEXT_PUBLIC_GOOGLE_SHEETS_URL="https://docs.google.com/spreadsheets/d/1w894o27P0eF4Sgt59l11_VfW995Y3pLwO77mB8Jk2sQ/edit"

# MongoDB Database Connection String (Optional, falls back to data/*.json)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/himel-agro-erp?retryWrites=true&w=majority"
```

---

## 🏷️ Ring Number Specification

Himel's Pet House ERP enforces a standardized physical ring numbering system:

$$\text{Physical Ring Format:} \quad \mathbf{YYYY \mid SS \mid Farm \mid Contact}$$

| Component | Meaning | Example |
| :--- | :--- | :--- |
| **YYYY** | Hatch / Registration Year | `2026` |
| **SS** | 2-Digit Serial Number | `01` |
| **Farm** | Certified Farm Name | `Himel's Pet House` |
| **Contact** | Certified Loft Phone | `01560059954` |

**Physical Ring Badge:**
```text
[ 2026 | 01 | Himel's Pet House | 01560059954 ]
```

---

## 🛠️ Tech Stack

- **Frontend & Fullstack**: [Next.js 16.3](https://nextjs.org/) (Turbopack, App Router)
- **Runtime**: [React 19.2](https://react.dev/)
- **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/) + Handcrafted Pigeon Domain Icons (`CockPigeonIcon`, `HenPigeonIcon`, `SquabIcon`, `TakaIcon`)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html-to-image](https://github.com/bubkoo/html-to-image)
- **Database & Storage**: Dual Storage Adapter ([MongoDB Atlas / Mongoose](https://www.mongodb.com/) + file-backed JSON store in `data/`)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mehedi-Hasan-Himel/himel-agro-erp.git
   cd himel-agro-erp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Google Sheets and MongoDB credentials.

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Available Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Runs the Next.js development server with Turbopack Fast Refresh |
| `npm run build` | Compiles the production build with full static/dynamic route verification |
| `npm run start` | Starts the optimized production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `npx tsc --noEmit` | Runs the TypeScript compiler to ensure 0 type errors |

---

## 📍 Loft Contact & Socials

- **Farm / Loft Name**: **Himel's Pet House**
- **Loft Master**: **Mehedi Hasan Himel**
- **Official Loft Phone**: `+880 1560059954`
- **WhatsApp**: [Chat on WhatsApp (+8801560059954)](https://wa.me/8801560059954)
- **Facebook**: [facebook.com/Himel.Pet.House](https://www.facebook.com/Himel.Pet.House)
- **Location**: [Loft Location on Google Maps](https://maps.app.goo.gl/rxvdsxq8ydnqfEKQ6)
- **Live Production ERP**: [https://himel-agro-erp.vercel.app](https://himel-agro-erp.vercel.app)

---

<div align="center">
  <p>© 2026 Himel's Pet House. Built with pride for professional avian fanciers.</p>
</div>
