import type { MonthlyData, Expense, CustomCategory } from '../types';
import { getCurrentMonth } from './calculations';

export interface TimeMetrics {
    monthsOfLivingExpenses: number;
    yearsOfBasicLiving: number;
    yearsOfSchoolFees: number;
    emergencyBufferStatus: 'Basic' | 'Healthy' | 'Strong';
}

export interface ProjectionResult {
    averageIncome: number;
    averageExpenses: number;
    averageSavings: number;
    averageNeeds: number;
    averageSchoolFees: number;
    yearlyProjection: number;
    headline: string;
    monthsAnalyzed: number;
    timeMetrics: TimeMetrics;
}

/**
 * Filter and identify the last 3-6 completed months for analysis.
 * Excludes the current month.
 */
export const getAnalysisMonths = (history: MonthlyData[], limit: number = 6): MonthlyData[] => {
    const currentMonth = getCurrentMonth();

    // Filter out current month and months with zero income
    const completedMonths = history
        .filter(m => m.month < currentMonth)
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

    // Find "School Fees" category or subcategory
    const schoolFeesCategoryIds = categories
        .filter(c => c.name.toLowerCase().includes('school fees'))
        .map(c => c.id);

    const relevantExpenses = expenses.filter(e => monthKeys.has(e.month));

    const totalSchoolFees = relevantExpenses
        .filter(e =>
            schoolFeesCategoryIds.includes(e.categoryId) ||
            (e.subcategoryId && schoolFeesCategoryIds.includes(e.subcategoryId)) ||
            e.description.toLowerCase().includes('school fees')
        )
        .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = analysisMonths.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = analysisMonths.reduce((sum, m) => sum + m.expenses, 0);
    const totalSavings = analysisMonths.reduce((sum, m) => sum + m.savings, 0);
    const totalNeeds = analysisMonths.reduce((sum, m) => sum + m.needs, 0);

    const count = analysisMonths.length;
    const averageIncome = totalIncome / count;
    const averageExpenses = totalExpenses / count;
    const averageSavings = totalSavings / count;
    const averageNeeds = totalNeeds / count;
    const averageSchoolFees = totalSchoolFees / count;

    const yearlyProjection = averageSavings * 12;
    const headline = generateProjectionHeadline(yearlyProjection);

    // Time Metrics
    const monthsOfLivingExpenses = (averageExpenses > 0 && yearlyProjection > 0) ? yearlyProjection / averageExpenses : 0;
    const yearsOfBasicLiving = (averageNeeds * 12 > 0 && yearlyProjection > 0) ? yearlyProjection / (averageNeeds * 12) : 0;
    const yearsOfSchoolFees = (averageSchoolFees * 12 > 0 && yearlyProjection > 0) ? yearlyProjection / (averageSchoolFees * 12) : 0;

    let emergencyBufferStatus: 'Basic' | 'Healthy' | 'Strong' = 'Basic';
    if (monthsOfLivingExpenses > 6) emergencyBufferStatus = 'Strong';
    else if (monthsOfLivingExpenses >= 3) emergencyBufferStatus = 'Healthy';

    return {
        averageIncome,
        averageExpenses,
        averageSavings,
        averageNeeds,
        averageSchoolFees,
        yearlyProjection,
        headline,
        monthsAnalyzed: count,
        timeMetrics: {
            monthsOfLivingExpenses,
            yearsOfBasicLiving,
            yearsOfSchoolFees,
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
