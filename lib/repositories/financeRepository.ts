import {
  Transaction,
  TransactionType,
  MonthlyFinancialSummary,
} from "@/types/finance";
import { getItem, setItem } from "./storageAdapter";

export async function getTransactions(filter?: {
  type?: TransactionType | "ALL";
  month?: string; // YYYY-MM
  category?: string;
}): Promise<Transaction[]> {
  const transactions = getItem<Transaction[]>("TRANSACTIONS");
  let list = [...transactions];

  if (filter?.type && filter.type !== "ALL") {
    list = list.filter((t) => t.type === filter.type);
  }

  if (filter?.month) {
    list = list.filter((t) => t.date.startsWith(filter.month!));
  }

  if (filter?.category && filter.category !== "ALL") {
    list = list.filter((t) => t.category === filter.category);
  }

  // Sort by date descending
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  if (data.amount <= 0) {
    throw new Error("Transaction amount must be greater than 0.");
  }

  const transactions = getItem<Transaction[]>("TRANSACTIONS");
  const id = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newTxn: Transaction = {
    id,
    ...data,
    createdAt: now,
  };

  const updated = [newTxn, ...transactions];
  setItem("TRANSACTIONS", updated);
  return newTxn;
}

export async function deleteTransaction(id: string): Promise<void> {
  const transactions = getItem<Transaction[]>("TRANSACTIONS");
  const filtered = transactions.filter((t) => t.id !== id);
  setItem("TRANSACTIONS", filtered);
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function getMonthlySummaries(): Promise<MonthlyFinancialSummary[]> {
  const transactions = await getTransactions();
  const map = new Map<
    string,
    {
      year: number;
      month: number;
      income: number;
      expense: number;
      count: number;
    }
  >();

  transactions.forEach((txn) => {
    if (!txn.date) return;
    const [yearStr, monthStr] = txn.date.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    if (!year || !month) return;

    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const existing = map.get(monthKey) || {
      year,
      month,
      income: 0,
      expense: 0,
      count: 0,
    };

    if (txn.type === "INCOME") {
      existing.income += txn.amount || 0;
    } else if (txn.type === "EXPENSE") {
      existing.expense += txn.amount || 0;
    }
    existing.count += 1;
    map.set(monthKey, existing);
  });

  const summaries: MonthlyFinancialSummary[] = [];

  map.forEach((val, monthKey) => {
    const monthLabel = `${MONTH_NAMES[val.month - 1]} ${val.year}`;
    summaries.push({
      year: val.year,
      month: val.month,
      monthKey,
      monthLabel,
      totalIncome: val.income,
      totalExpense: val.expense,
      profitLoss: val.income - val.expense,
      transactionCount: val.count,
    });
  });

  // Sort by monthKey descending
  return summaries.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}

export async function getFinancialSummaryForMonth(
  monthKey: string
): Promise<MonthlyFinancialSummary> {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const txns = await getTransactions({ month: monthKey });
  const totalIncome = txns
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = txns
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return {
    year,
    month,
    monthKey,
    monthLabel: `${MONTH_NAMES[month - 1] || "Month"} ${year}`,
    totalIncome,
    totalExpense,
    profitLoss: totalIncome - totalExpense,
    transactionCount: txns.length,
  };
}
