import type { MonthlyData, Expense, CustomCategory } from '../types';

export interface CategoryCoverage {
    name: string;
    icon: string;
    monthsCovered: number;
}

export interface TimeMetrics {
    monthsOfLivingExpenses: number;
    topCategoriesCovered: CategoryCoverage[];
    emergencyBufferStatus: 'Basic' | 'Healthy' | 'Strong';
}

export interface ProjectionResult {
    averageIncome: number;
    averageExpenses: number;
    averageSavings: number;
    yearlyProjection: number;
    headline: string;
    monthsAnalyzed: number;
    timeMetrics: TimeMetrics;
}

/**
 * Filter and identify the last 3-6 completed months for analysis.
 * Analysis is relative to the selectedMonth (exclusive).
 */
export const getAnalysisMonths = (history: MonthlyData[], selectedMonth: string, limit: number = 6): MonthlyData[] => {
    // Filter out selected month and future months, and months with zero income
    const completedMonths = history
        .filter(m => m.month < selectedMonth)
        .filter(m => m.income > 0)
        .sort((a, b) => b.month.localeCompare(a.month)); // Newest first

    return completedMonths.slice(0, limit);
};

/**
 * Calculate projections based on historical averages.
 */
export const calculateProjections = (
    analysisMonths: MonthlyData[],
    expenses: Expense[],
    categories: CustomCategory[]
): ProjectionResult | null => {
    if (analysisMonths.length < 3) {
        return null;
    }

    const monthKeys = new Set(analysisMonths.map(m => m.month));
    const relevantExpenses = expenses.filter(e => monthKeys.has(e.month));

    // Analyze top categories
    const categoryTotals: Record<string, number> = {};
    relevantExpenses.forEach(e => {
        categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
    });

    const count = analysisMonths.length;
    const topCategoryIds = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    const totalIncome = analysisMonths.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = analysisMonths.reduce((sum, m) => sum + m.expenses, 0);
    const totalSavings = analysisMonths.reduce((sum, m) => sum + m.savings, 0);

    const averageIncome = totalIncome / count;
    const averageExpenses = totalExpenses / count;
    const averageSavings = totalSavings / count;

    const yearlyProjection = averageSavings * 12;
    const headline = generateProjectionHeadline(yearlyProjection);

    // Time Metrics
    const monthsOfLivingExpenses = (averageExpenses > 0 && yearlyProjection > 0) ? yearlyProjection / averageExpenses : 0;

    const topCategoriesCovered: CategoryCoverage[] = topCategoryIds.map(([id, total]) => {
        const cat = categories.find(c => c.id === id);
        const avgMonthlyCat = total / count;
        return {
            name: cat?.name || 'Unknown',
            icon: cat?.icon || '💰',
            monthsCovered: avgMonthlyCat > 0 && yearlyProjection > 0 ? yearlyProjection / avgMonthlyCat : 0
        };
    });

    let emergencyBufferStatus: 'Basic' | 'Healthy' | 'Strong' = 'Basic';
    if (monthsOfLivingExpenses > 6) emergencyBufferStatus = 'Strong';
    else if (monthsOfLivingExpenses >= 3) emergencyBufferStatus = 'Healthy';

    return {
        averageIncome,
        averageExpenses,
        averageSavings,
        yearlyProjection,
        headline,
        monthsAnalyzed: count,
        timeMetrics: {
            monthsOfLivingExpenses,
            topCategoriesCovered,
            emergencyBufferStatus
        }
    };
};

/**
 * Generate a neutral, factual headline for the projection.
 * Neutral verbs: grows, shrinks, remains, disappears.
 */
const generateProjectionHeadline = (yearlySavings: number): string => {
    // The amount will be formatted by the component using formatCurrency

    if (yearlySavings > 0) {
        return `Savings grow by ~##AMOUNT##.`;
    } else if (yearlySavings < 0) {
        return `Spending exceeds income by ~##AMOUNT##.`;
    } else {
        return `Savings remain unchanged.`;
    }
};
