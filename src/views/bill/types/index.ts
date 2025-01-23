import type { Bill } from "@/api/bill/types";

export interface ProcessedBill extends Bill {
  hour: number;
  isWeekend: boolean;
}

export interface CategoryStats {
  amount: number;
  count: number;
}

export interface TimelineStats {
  expense: number;
  income: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface CategoryData {
  categories: string[];
  expenses: number[];
  incomes: number[];
  counts: number[];
  timeLabels: string[];
  timeExpenses: number[];
  timeIncomes: number[];
  timeCounts: number[];
  currentDimension: "category" | "time";
}

export interface LargeExpenseData {
  dates: string[];
  amounts: number[];
  merchants: string[];
}
