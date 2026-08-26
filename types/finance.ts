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

export interface Transaction {
  id: string;

  type: TransactionType;

  date: string; // YYYY-MM-DD

  category: TransactionCategory;

  amount: number; // in BDT (positive value)

  description?: string;

  pigeonId?: string;
  feedPurchaseId?: string;

  notes?: string;

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
