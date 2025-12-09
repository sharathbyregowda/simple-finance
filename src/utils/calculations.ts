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
    // OLD: const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    // NEW: We calculate total expenses after getting the breakdown to exclude 'savings' category
    const recommended = calculate50_30_20(totalIncome);
    const actual = calculateActualBreakdown(monthExpenses);

    // Total Expenses = Needs + Wants (Excluding Savings contributions)
    const totalExpenses = actual.needs + actual.wants;

    // Net Savings = Income - Expenses (Needs + Wants)
    // This effectively matches: Actual Savings Contributions + Unallocated Cash
    const netSavings = totalIncome - totalExpenses;

    const needsPercentage = totalIncome > 0 ? (actual.needs / totalIncome) * 100 : 0;
    const wantsPercentage = totalIncome > 0 ? (actual.wants / totalIncome) * 100 : 0;
    const savingsPercentage = totalIncome > 0 ? (actual.savings / totalIncome) * 100 : 0;

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

export const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
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
    return `${symbol}${amount.toLocaleString()}`;
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

