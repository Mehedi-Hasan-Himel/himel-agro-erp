export type TransactionType = "INCOME" | "EXPENSE";

export type ExpenseCategory =
  | "Feed"
  | "Medicine"
  | "Cage/Loft Equipment"
  | "Transportation"
  | "Pigeon Purchase"
  | "Ring Tag Purchase"
  | "Other";

export type IncomeCategory =
  | "Pigeon Sale"
  | "Breeding Service"
  | "Prize Money"
  | "Other";

export type TransactionCategory = ExpenseCategory | IncomeCategory | string;

export type FinanceSector = "PIGEON" | "GOAT" | "SHARED";

export interface Transaction {
  id: string;

  type: TransactionType;

  date: string; // YYYY-MM-DD

  category: TransactionCategory;

  amount: number; // in BDT (positive value)

  description?: string;

  sectorId?: FinanceSector | string; // PIGEON, GOAT, SHARED

  pigeonId?: string;
  animalId?: string; // Generic animal ID (goat, cow, etc.)
  feedPurchaseId?: string;

  notes?: string;

  customer?: string;

  createdAt?: string;
}

export interface MonthlyFinancialSummary {
  year: number;
  month: number; // 1-12
  monthKey: string; // YYYY-MM
  monthLabel: string; // e.g. "August 2026"
  totalIncome: number;
  totalExpense: number;
  profitLoss: number;
  transactionCount: number;
}

export interface SectorFinancialComparison {
  sectorId: string;
  sectorName: string;
  icon: string;
  totalIncome: number;
  totalExpense: number;
  profitLoss: number;
  marginPercentage: number;
  transactionCount: number;
}

