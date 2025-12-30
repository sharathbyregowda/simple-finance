export const ExpenseCategory = {
  NEEDS: 'needs',
  WANTS: 'wants',
  SAVINGS: 'savings',
  INCOME: 'income',
} as const;

export type ExpenseCategory = typeof ExpenseCategory[keyof typeof ExpenseCategory];

export interface CustomCategory {
  id: string;
  name: string;
  type: ExpenseCategory;
  icon?: string;
  color?: string;
  parentId?: string; // Reference to parent category (undefined for top-level)
  isSubcategory?: boolean; // Flag to identify subcategories
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  month: string; // Format: YYYY-MM
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string; // References CustomCategory.id
  subcategoryId?: string; // Optional reference to subcategory
  categoryType: ExpenseCategory; // Derived from category
  date: string;
  month: string; // Format: YYYY-MM
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;

  // 50/30/20 Recommended
  recommendedNeeds: number;
  recommendedWants: number;
  recommendedSavings: number;

  // Actual spending
  actualNeeds: number;
  actualWants: number;
  actualSavings: number;

  // Percentages
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  unallocatedCash: number;
  // Status
  isOverBudget: boolean;
  needsStatus: 'under' | 'over' | 'on-track';
  wantsStatus: 'under' | 'over' | 'on-track';
  savingsStatus: 'under' | 'over' | 'on-track';
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  needs: number;
  wants: number;
}

// Recurring Transactions
export type RecurrenceFrequency = 'monthly'; // Future: 'weekly' | 'biweekly' | 'annual'

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;

  // For income
  source?: string;

  // For expense
  description?: string;
  categoryId?: string;
  subcategoryId?: string;

  // Schedule
  frequency: RecurrenceFrequency;
  dayOfMonth: number; // 1-28 (avoid 29-31 edge cases)

  // Tracking
  isActive: boolean;
  lastAppliedMonth?: string; // YYYY-MM format - tracks when last applied
  createdAt: string; // ISO date string
}

export interface FinancialData {
  incomes: Income[];
  expenses: Expense[];
  customCategories: CustomCategory[];
  currentMonth: string; // Format: YYYY-MM
  currency: string; // Currency code (USD, EUR, GBP, INR, etc.)
  isOnboarded?: boolean; // Track if user has completed onboarding
  version?: number; // Data schema version for migrations
  recurringTransactions?: RecurringTransaction[]; // Recurring transaction templates
}

export interface CategoryHierarchy {
  category: CustomCategory;
  subcategories: CustomCategory[];
}

export interface CategoryExpenseData {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryType: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
  [key: string]: any;
}

