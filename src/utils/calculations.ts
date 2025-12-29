import type { BudgetSummary, Expense, Income, MonthlyData } from '../types';
import { ExpenseCategory } from '../types';

export const calculate50_30_20 = (totalIncome: number) => {
    return {
        needs: totalIncome * 0.5,
        wants: totalIncome * 0.3,
        savings: totalIncome * 0.2,
    };
};

export const calculateActualBreakdown = (expenses: Expense[]) => {
    const breakdown = {
        needs: 0,
        wants: 0,
        savings: 0,
    };

    expenses.forEach((expense) => {
        switch (expense.categoryType) {
            case ExpenseCategory.NEEDS:
                breakdown.needs += expense.amount;
                break;
            case ExpenseCategory.WANTS:
                breakdown.wants += expense.amount;
                break;
            case ExpenseCategory.SAVINGS:
                breakdown.savings += expense.amount;
                break;
        }
    });

    return breakdown;
};

export const calculateBudgetSummary = (
    incomes: Income[],
    expenses: Expense[],
    currentMonth: string
): BudgetSummary => {
    // Check if yearly summary
    const isYearly = currentMonth.endsWith('-ALL');
    const year = currentMonth.split('-')[0];

    // Filter for current month or year
    const monthIncomes = incomes.filter((income) =>
        isYearly ? income.month.startsWith(year) : income.month === currentMonth
    );
    const monthExpenses = expenses.filter((expense) =>
        isYearly ? expense.month.startsWith(year) : expense.month === currentMonth
    );


    const totalIncome = monthIncomes.reduce((sum, income) => sum + income.amount, 0);
    const recommended = calculate50_30_20(totalIncome);
    const actual = calculateActualBreakdown(monthExpenses);

    // Total Expenses = Needs + Wants (Excluding Savings contributions)
    // We exclude 'savings' type expenses from Total Expenses because they are technically
    // transfers to savings, not money 'spent' in the context of Net Savings capacity.
    const totalExpenses = actual.needs + actual.wants;

    // Net Savings (Total Savings Capacity) = Income - Expenses (Needs + Wants)
    // This represents the total amount available for savings (whether allocated or not)
    // effectively: Actual Savings Contributions + Unallocated Cash
    const netSavings = totalIncome - totalExpenses;

    const needsPercentage = totalIncome > 0 ? (actual.needs / totalIncome) * 100 : 0;
    const wantsPercentage = totalIncome > 0 ? (actual.wants / totalIncome) * 100 : 0;
    const savingsPercentage = totalIncome > 0 ? (actual.savings / totalIncome) * 100 : 0;

    // Unallocated Cash = Net Savings - Actual Savings Contributions
    // This is the actual cash remaining in the account after all expenses and savings transfers
    const unallocatedCash = netSavings - actual.savings;

    const getStatus = (actual: number, recommended: number): 'under' | 'over' | 'on-track' => {
        const tolerance = 0.05; // 5% tolerance
        const ratio = actual / recommended;
        if (ratio < 1 - tolerance) return 'under';
        if (ratio > 1 + tolerance) return 'over';
        return 'on-track';
    };

    return {
        totalIncome,
        totalExpenses,
        netSavings,
        recommendedNeeds: recommended.needs,
        recommendedWants: recommended.wants,
        recommendedSavings: recommended.savings,
        actualNeeds: actual.needs,
        actualWants: actual.wants,
        actualSavings: actual.savings,
        needsPercentage,
        wantsPercentage,
        savingsPercentage,
        unallocatedCash,
        isOverBudget: totalExpenses > totalIncome,
        needsStatus: getStatus(actual.needs, recommended.needs),
        wantsStatus: getStatus(actual.wants, recommended.wants),
        savingsStatus: getStatus(actual.savings, recommended.savings),
    };
};

export const calculateSavingsRate = (totalIncome: number, totalExpenses: number): number => {
    if (totalIncome === 0) return 0;
    // Net Savings = Total Income - Total Expenses (where Expenses = Needs + Wants)
    return ((totalIncome - totalExpenses) / totalIncome) * 100;
};

export const calculateMonthlyTrends = (
    incomes: Income[],
    expenses: Expense[]
): MonthlyData[] => {
    const monthMap = new Map<string, MonthlyData>();

    // Initialize months from incomes and expenses
    [...incomes, ...expenses].forEach((item) => {
        if (!monthMap.has(item.month)) {
            monthMap.set(item.month, {
                month: item.month,
                income: 0,
                expenses: 0,
                savings: 0,
                needs: 0,
                wants: 0,
            });
        }
    });

    // Add income data
    incomes.forEach((income) => {
        const data = monthMap.get(income.month)!;
        data.income += income.amount;
    });

    // Add expense data
    expenses.forEach((expense) => {
        const data = monthMap.get(expense.month)!;
        // Only add to total expenses if it's not a savings contribution
        // This ensures Total Expenses = Needs + Wants
        if (expense.categoryType !== ExpenseCategory.SAVINGS) {
            data.expenses += expense.amount;
        }

        switch (expense.categoryType) {
            case ExpenseCategory.NEEDS:
                data.needs += expense.amount;
                break;
            case ExpenseCategory.WANTS:
                data.wants += expense.amount;
                break;
            case ExpenseCategory.SAVINGS:
                data.savings += expense.amount;
                break;
        }
    });

    // Calculate savings
    monthMap.forEach((data) => {
        data.savings = data.income - data.expenses;
    });

    // Convert to array and sort by month
    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
};

export interface YearlyData {
    year: string;
    income: number;
    expenses: number;
    savings: number;
    needs: number;
    wants: number;
}

export const calculateYearlyTrends = (monthlyHistory: MonthlyData[]): YearlyData[] => {
    const yearMap = new Map<string, YearlyData>();

    monthlyHistory.forEach((monthData) => {
        const year = monthData.month.split('-')[0];
        if (!yearMap.has(year)) {
            yearMap.set(year, {
                year,
                income: 0,
                expenses: 0,
                savings: 0,
                needs: 0,
                wants: 0,
            });
        }

        const yearData = yearMap.get(year)!;
        yearData.income += monthData.income;
        yearData.expenses += monthData.expenses;
        yearData.savings += monthData.savings;
        yearData.needs += monthData.needs;
        yearData.wants += monthData.wants;
    });

    return Array.from(yearMap.values()).sort((a, b) => a.year.localeCompare(b.year));
};

export const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD', options?: Intl.NumberFormatOptions): string => {
    // Map common currency codes to their symbols
    const currencySymbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        JPY: '¥',
        CNY: '¥',
        AUD: 'A$',
        CAD: 'C$',
        CHF: 'Fr',
        SGD: 'S$',
    };

    const symbol = currencySymbols[currencyCode] || '$';

    // Use toLocaleString options if provided, otherwise default behavior
    const formattedNumber = options
        ? amount.toLocaleString(undefined, options)
        : amount.toLocaleString();

    return `${symbol}${formattedNumber}`;
};

export const formatMonth = (monthStr: string): string => {
    if (monthStr.endsWith('-ALL')) {
        const year = monthStr.split('-')[0];
        return `Yearly Summary ${year}`;
    }
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const calculateCategoryBreakdown = (
    expenses: Expense[],
    categories: import('../types').CustomCategory[],
    month: string
): import('../types').CategoryExpenseData[] => {
    // Check if yearly summary
    const isYearly = month.endsWith('-ALL');
    const year = month.split('-')[0];

    // Filter expenses for the specified month or year
    const monthExpenses = expenses.filter((expense) =>
        isYearly ? expense.month.startsWith(year) : expense.month === month
    );

    // Calculate total expenses for percentage calculation
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Group expenses by category
    const categoryMap = new Map<string, number>();

    monthExpenses.forEach((expense) => {
        const categoryId = expense.subcategoryId || expense.categoryId;
        const currentAmount = categoryMap.get(categoryId) || 0;
        categoryMap.set(categoryId, currentAmount + expense.amount);
    });

    // Build category expense data
    const categoryData: import('../types').CategoryExpenseData[] = [];

    categoryMap.forEach((amount, categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        if (category) {
            categoryData.push({
                categoryId: category.id,
                categoryName: category.name,
                categoryIcon: category.icon || '📌',
                categoryType: category.type,
                amount,
                percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
                color: category.color || getCategoryColor(category.type),
            });
        }
    });

    // Sort by amount descending
    return categoryData.sort((a, b) => b.amount - a.amount);
};

export const getTopCategories = (
    categoryData: import('../types').CategoryExpenseData[],
    limit: number = 5
): import('../types').CategoryExpenseData[] => {
    return categoryData.slice(0, limit);
};

const getCategoryColor = (type: import('../types').ExpenseCategory): string => {
    switch (type) {
        case 'needs':
            return '#F59E0B'; // Amber
        case 'wants':
            return '#A855F7'; // Purple
        case 'savings':
            return '#3B82F6'; // Blue
        default:
            return '#94A3B8'; // Gray
    }
};

/**
 * Calculate average monthly cash balance growth
 * Cash balance = Income - Expenses - Savings Contributions
 * This is the unallocated cash remaining after all spending and savings
 * Returns average cash balance growth across completed months
 */
export const calculateAverageMonthlyCashBalance = (
    incomes: Income[],
    expenses: Expense[],
    excludeCurrentMonth: boolean = true
): number => {
    const monthlyHistory = calculateMonthlyTrends(incomes, expenses);

    let months = monthlyHistory;
    if (excludeCurrentMonth) {
        const current = getCurrentMonth();
        months = months.filter(m => m.month < current);
    }

    if (months.length === 0) return 0;

    // For each month, calculate cash balance
    // Cash balance = Income - Expenses (Needs + Wants) - Savings Contributions
    // Note: monthlyHistory.expenses already excludes savings contributions
    // Note: monthlyHistory.savings contains the savings contributions
    const cashBalances = months.map(month => {
        const actualBreakdown = calculateActualBreakdown(
            expenses.filter(e => e.month === month.month)
        );
        // Cash balance = Income - Total Expenses - Savings Contributions
        return month.income - month.expenses - actualBreakdown.savings;
    });

    const totalCashBalance = cashBalances.reduce((sum, balance) => sum + balance, 0);
    return totalCashBalance / months.length;
};

/**
 * Calculate months needed to reach a savings goal based on cash balance growth
 */
export const calculateGoalTimeline = (
    goalAmount: number,
    startingBalance: number,
    averageMonthlyCashBalance: number
): { months: number; isAchievable: boolean; message: string; completionDate?: Date } => {
    if (startingBalance >= goalAmount) {
        return {
            months: 0,
            isAchievable: true,
            message: "You've already reached this goal! 🎉"
        };
    }

    const remaining = goalAmount - startingBalance;

    if (averageMonthlyCashBalance <= 0) {
        return {
            months: -1,
            isAchievable: false,
            message: "Based on your data, you're not currently building cash balance. Reduce expenses or increase income to reach this goal."
        };
    }

    const months = Math.ceil(remaining / averageMonthlyCashBalance);

    // Calculate estimated completion date
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + months);

    return {
        months,
        isAchievable: true,
        message: `At your current pace, you will reach this goal in ${months} month${months !== 1 ? 's' : ''}.`,
        completionDate
    };
};
