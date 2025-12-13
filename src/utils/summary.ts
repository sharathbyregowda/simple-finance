import type { BudgetSummary, Expense, MonthlyData } from '../types';
import { calculateCategoryBreakdown, formatCurrency } from './calculations';

interface SummaryInput {
    currentMonth: string;
    budgetSummary: BudgetSummary;
    expenses: Expense[];
    categories: import('../types').CustomCategory[];
    monthlyHistory: MonthlyData[]; // Sorted chronological
}

export const generateMonthlySummary = (input: SummaryInput): string[] => {
    const { currentMonth, budgetSummary, expenses, categories, monthlyHistory } = input;
    const bullets: string[] = [];

    // 1. Overall Outcome
    // Plan = Income. (Or 50/30/20 sum which is income).
    // If expenses > income, over planned.
    const difference = budgetSummary.totalExpenses - budgetSummary.totalIncome;
    const isOver = difference > 0;

    if (isOver) {
        bullets.push(`Total spending was ${formatCurrency(difference)} above your income.`);
    } else {
        bullets.push(`Total spending was ${formatCurrency(Math.abs(difference))} below your income.`);
    }

    // 2. Needs / Wants / Savings comparison
    // Compare Actual vs Recommended (50/30/20)

    const checkVariance = (actual: number, recommended: number, name: string) => {
        const diff = actual - recommended;
        // Threshold: only mention if variance is > 5% of recommended or > 100 currency units
        if (Math.abs(diff) > (recommended * 0.05) || Math.abs(diff) > 100) {
            if (diff > 0) {
                bullets.push(`You spent ${formatCurrency(diff)} more than planned on ${name}.`);
            } else if (name === 'Savings') {
                bullets.push(`You saved ${formatCurrency(Math.abs(diff))} less than the 20% target.`);
            } else {
                // Under spending on needs/wants is usually fine, maybe skip or say "kept Needs well under..."
                // User asked for "Compare against user's budget".
                bullets.push(`You spent ${formatCurrency(Math.abs(diff))} less than planned on ${name}.`);
            }
        }
    };

    checkVariance(budgetSummary.actualNeeds, budgetSummary.recommendedNeeds, 'Needs');
    checkVariance(budgetSummary.actualWants, budgetSummary.recommendedWants, 'Wants');
    checkVariance(budgetSummary.actualSavings, budgetSummary.recommendedSavings, 'Savings');

    // 3. Top Drivers
    // Find category with highest spend OR highest variance if we had category monthly targets (we don't really).
    // Let's use highest absolute spend for now, or maybe highest % of total expenses.
    // Spec says: "Identify up to 2 categories that explain most variance" -> implication is variance against "Plan".
    // Since we don't have per-category budgets, "variance" is hard. 
    // Proxy: "Top contributors to spending" is safer.
    // Or: "Identify categories responsible for overspending" if over budget.

    // Let's calculate breakdown
    const breakdown = calculateCategoryBreakdown(expenses, categories, currentMonth);
    const topCategories = breakdown.sort((a, b) => b.total - a.total).slice(0, 2);

    if (topCategories.length > 0) {
        const names = topCategories.map(c => c.categoryName).join(' and ');
        const totalTop = topCategories.reduce((sum, c) => sum + c.total, 0);
        const pct = Math.round((totalTop / budgetSummary.totalExpenses) * 100);
        bullets.push(`${names} made up ${pct}% of total spending.`);
    }

    // 4. Savings Health
    const currentSavingsRate = budgetSummary.savingsPercentage;
    // Find previous month
    // monthlyHistory is assumed sorted. Find index of current, go back 1.
    const currentIndex = monthlyHistory.findIndex(m => m.month === currentMonth);

    let prevSavingsRate = 0;
    if (currentIndex > 0) {
        const prev = monthlyHistory[currentIndex - 1];
        // Re-calc rate for prev month? Or do store it? MonthlyData has 'savings' (amount).
        // need income for rate. MonthlyData has 'income'.
        if (prev.income > 0) {
            prevSavingsRate = Math.round((prev.savings / prev.income) * 100);
        }
    }

    bullets.push(`Current savings rate is ${currentSavingsRate}%.`);

    if (currentIndex > 0) {
        const diff = currentSavingsRate - prevSavingsRate;
        if (Math.abs(diff) >= 1) {
            bullets.push(`Savings ${diff > 0 ? 'rose' : 'fell'} from ${prevSavingsRate}% to ${currentSavingsRate}%.`);
        }
    }

    // 5. Trend Signal (3+ months)
    // Need at least 3 months including current
    if (currentIndex >= 2) {
        const m1 = monthlyHistory[currentIndex];
        const m2 = monthlyHistory[currentIndex - 1];
        const m3 = monthlyHistory[currentIndex - 2];

        // Helper for trend
        const getVal = (m: MonthlyData, type: 'needs' | 'wants' | 'savings') => m[type];

        // Check increasing expenses
        ['needs', 'wants'].forEach(type => {
            const v1 = getVal(m1, type as any);
            const v2 = getVal(m2, type as any);
            const v3 = getVal(m3, type as any);

            if (v1 > v2 && v2 > v3) {
                const name = type.charAt(0).toUpperCase() + type.slice(1);
                bullets.push(`${name} spending has increased for three consecutive months.`);
            }
        });

        // Check decreasing savings
        if (m1.savings < m2.savings && m2.savings < m3.savings) {
            bullets.push(`Savings have decreased for three consecutive months.`);
        }
    }

    // Max 8 bullets
    return bullets.slice(0, 8);
};
