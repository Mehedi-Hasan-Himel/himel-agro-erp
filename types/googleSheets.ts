export const DEFAULT_PIGEONS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1dCweSXhbITgKBtJ_GNZ7HbDncAw6e8FwcMR5t2e-VI8/edit?usp=sharing";

export const DEFAULT_FINANCE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1yKxCzT1oji-wJJKuUG3OhyH1V-dAG3nwpSKNbwIwNOI/edit?usp=sharing";

export const DEFAULT_GOOGLE_SHEET_URL = DEFAULT_PIGEONS_SHEET_URL;

export interface GoogleSheetPigeonRow {
  ringNumber: string;
  category?: string;
  breed?: string;
  hatchDate?: string;
  colorPattern?: string;
  gender?: string;
  status?: string;
  notes?: string;
  father?: string;
  mother?: string;
  homeRaceKm?: string;
  returnSpeed?: string;
  potentialGrade?: string;
}

export interface GoogleSheetFinanceRow {
  name: string;
  income: number;
  expense: number;
  comments?: string;
  customer?: string;
  month?: string;
}

export interface GoogleSheetsSyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  sheetUrl: string;
  spreadsheetId: string;
  totalRows: number;
  addedCount: number;
  updatedCount: number;
  unchangedCount: number;
  errors: string[];
}

export interface GoogleSheetsFinanceSyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  sheetUrl: string;
  spreadsheetId: string;
  totalRows: number;
  addedCount: number;
  updatedCount: number;
  unchangedCount: number;
  totalIncome: number;
  totalExpense: number;
  netProfitLoss: number;
  errors: string[];
}

export interface DualSheetSyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  pigeons: GoogleSheetsSyncResult;
  finance: GoogleSheetsFinanceSyncResult;
}

export interface GoogleSheetsConfig {
  pigeonsSheetUrl: string;
  financeSheetUrl: string;
  sheetUrl?: string;
  autoSync: boolean;
  intervalMinutes: number;
  lastSyncedAt?: string;
  lastSyncStatus?: "SUCCESS" | "ERROR";
  lastSyncMessage?: string;
  totalSynced?: number;
}
