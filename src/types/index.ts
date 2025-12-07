export const ExpenseCategory = {
  NEEDS: 'needs',
  WANTS: 'wants',
  SAVINGS: 'savings',
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

export interface FinancialData {
  incomes: Income[];
  expenses: Expense[];
  customCategories: CustomCategory[];
  currentMonth: string; // Format: YYYY-MM
  currency: string; // Currency code (USD, EUR, GBP, INR, etc.)
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

