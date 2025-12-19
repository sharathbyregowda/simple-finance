import type { BudgetSummary, Expense, MonthlyData } from '../types';
import { calculateCategoryBreakdown, formatCurrency } from './calculations';
import { ExpenseCategory } from '../types';

// Priority definitions
const SummaryPriority = {
    OUTCOME: 1,
    VARIANCE_NEEDS: 2,
    VARIANCE_WANTS: 3,
    VARIANCE_SAVINGS: 4,
    DRIVERS: 5,
    SAVINGS_HEALTH: 6,
    TREND: 7,
    RECONCILIATION: 8
} as const;

type SummaryPriority = typeof SummaryPriority[keyof typeof SummaryPriority];

interface SummaryCandidate {
    priority: SummaryPriority;
    text: string;
    magnitude?: number; // For tie-breaking or threshold checks
    type: 'outcome' | 'variance' | 'driver' | 'savings' | 'trend' | 'repro';
    group?: string; // e.g. 'needs', 'wants'
}

interface GenericPeriodData {
    period: string;
    income: number;
    expenses: number;
    savings: number;
    needs: number;
    wants: number;
}

interface SummaryInput {
    period: string;
    isYearly: boolean;
    budgetSummary: BudgetSummary;
    expenses: Expense[];
    categories: import('../types').CustomCategory[];
    history: GenericPeriodData[]; // Sorted chronological
    currencyCode: string;
}

export const generateMonthlySummary = (input: {
    currentMonth: string;
    budgetSummary: BudgetSummary;
    expenses: Expense[];
    categories: import('../types').CustomCategory[];
    monthlyHistory: MonthlyData[];
    currencyCode: string;
}): string[] => {
    return generateSummaryInternal({
        period: input.currentMonth,
        isYearly: false,
        budgetSummary: input.budgetSummary,
        expenses: input.expenses,
        categories: input.categories,
        history: input.monthlyHistory.map(m => ({
            period: m.month,
            income: m.income,
            expenses: m.expenses,
            savings: m.savings,
            needs: m.needs,
            wants: m.wants
        })),
        currencyCode: input.currencyCode
    });
};

export const generateYearlySummary = (input: {
    year: string;
    budgetSummary: BudgetSummary;
    expenses: Expense[];
    categories: import('../types').CustomCategory[];
    yearlyHistory: import('./calculations').YearlyData[];
    currencyCode: string;
}): string[] => {
    return generateSummaryInternal({
        period: input.year,
        isYearly: true,
        budgetSummary: input.budgetSummary,
        expenses: input.expenses,
        categories: input.categories,
        history: input.yearlyHistory.map(y => ({
            period: y.year,
            income: y.income,
            expenses: y.expenses,
            savings: y.savings,
            needs: y.needs,
            wants: y.wants
        })),
        currencyCode: input.currencyCode
    });
};

const generateSummaryInternal = (input: SummaryInput): string[] => {
    const { period, isYearly, budgetSummary, expenses, categories, history, currencyCode } = input;
    const candidates: SummaryCandidate[] = [];
    const format = (amount: number) => formatCurrency(amount, currencyCode, { maximumFractionDigits: 0 });

    const periodLabel = isYearly ? 'yearly' : 'monthly';

    // --- 1. Overall Outcome (Priority 1: Mandatory) ---
    const diff = budgetSummary.totalExpenses - budgetSummary.totalIncome;
    const isOver = diff > 0;
    const outcomeText = isOver
        ? `Total ${periodLabel} spending was ${format(diff)} above your income.`
        : `Total ${periodLabel} spending was ${format(Math.abs(diff))} below your income.`;

    candidates.push({
        priority: SummaryPriority.OUTCOME,
        text: outcomeText,
        type: 'outcome',
        magnitude: Math.abs(diff)
    });

    // --- 2. Budget Variance (Priority 2) ---
    // Needs, Wants, Savings. Max 2 bullets.
    // Threshold: > 5% recommend or > 100
    const addVariance = (actual: number, recommended: number, name: 'Needs' | 'Wants' | 'Savings') => {
        const variance = actual - recommended;
        const absVar = Math.abs(variance);
        // Adjust threshold for yearly: if yearly, multiply threshold by 12?
        // Or keep it simple. Usually yearly variance will be larger anyway.
        const threshold = Math.max(recommended * 0.05, isYearly ? 1000 : 100);

        if (absVar > threshold) {
            let text = '';
            if (name === 'Savings') {
                // Different wording for Savings
                if (variance > 0) {
                    text = `Savings exceeded plan by ${format(absVar)}.`; // Positive
                } else {
                    text = `Saved ${format(absVar)} less than target.`; // Negative: "Saved X less..."
                }
            } else {
                if (variance > 0) {
                    text = `You spent ${format(absVar)} more than planned on ${name}.`;
                } else {
                    text = `You spent ${format(absVar)} less than planned on ${name}.`;
                }
            }

            // Determine priority
            let prio: SummaryPriority = SummaryPriority.VARIANCE_WANTS;
            if (name === 'Needs') prio = SummaryPriority.VARIANCE_NEEDS;
            if (name === 'Savings') prio = SummaryPriority.VARIANCE_SAVINGS;

            candidates.push({ priority: prio, text, type: 'variance', magnitude: absVar, group: name });
        }
    };

    addVariance(budgetSummary.actualNeeds, budgetSummary.recommendedNeeds, 'Needs');
    addVariance(budgetSummary.actualWants, budgetSummary.recommendedWants, 'Wants');
    addVariance(budgetSummary.actualSavings, budgetSummary.recommendedSavings, 'Savings');

    // --- 3. Top Spending Drivers (Priority 3) ---
    const breakdown = calculateCategoryBreakdown(expenses, categories, period + (isYearly ? '-ALL' : ''));
    const expenseBreakdown = breakdown.filter(c => c.categoryType !== ExpenseCategory.SAVINGS);
    const topCategories = expenseBreakdown.sort((a, b) => b.amount - a.amount);

    if (topCategories.length > 0 && budgetSummary.totalExpenses > 0) {
        let selected: typeof topCategories = [];
        let totalShare = 0;

        const top1 = topCategories[0];
        const top1Share = (top1.amount / budgetSummary.totalExpenses);

        if (top1Share >= 0.5) {
            selected = [top1];
            totalShare = top1Share;
        } else if (topCategories.length > 1) {
            const top2 = topCategories[1];
            const combinedShare = (top1.amount + top2.amount) / budgetSummary.totalExpenses;
            if (combinedShare >= 0.5) {
                selected = [top1, top2];
                totalShare = combinedShare;
            }
        }

        if (selected.length > 0) {
            const names = selected.map(c => c.categoryName).join(' and ');
            const pct = Math.round(totalShare * 100);
            candidates.push({
                priority: SummaryPriority.DRIVERS,
                text: `${names} made up ${pct}% of total ${periodLabel} spending.`,
                type: 'driver'
            });
        }
    }

    // --- 4. Savings Health (Priority 4) ---
    const currentIndex = history.findIndex(m => m.period === period);
    const currentSavingsRate = Math.round(budgetSummary.savingsPercentage);

    if (currentIndex > 0) {
        const prev = history[currentIndex - 1];
        if (prev.income > 0) {
            const prevSavingsRate = Math.round((prev.savings / prev.income) * 100);
            const rateDiff = currentSavingsRate - prevSavingsRate;
            if (Math.abs(rateDiff) >= 1) {
                const text = `Savings ${rateDiff > 0 ? 'increased' : 'fell'} from ${prevSavingsRate}% to ${currentSavingsRate}%.`;
                candidates.push({
                    priority: SummaryPriority.SAVINGS_HEALTH,
                    text,
                    type: 'savings'
                });
            }
        }
    }

    // --- 5. Trend Signal (Priority 5) ---
    if (currentIndex >= 2) {
        const p1 = history[currentIndex];
        const p2 = history[currentIndex - 1];
        const p3 = history[currentIndex - 2];
        const getVal = (p: GenericPeriodData, type: 'needs' | 'wants' | 'savings') => p[type];

        let trendFound = false;
        ['needs', 'wants'].forEach(type => {
            if (trendFound) return;
            const v1 = getVal(p1, type as any);
            const v2 = getVal(p2, type as any);
            const v3 = getVal(p3, type as any);
            if (v1 > v2 && v2 > v3) {
                const name = type.charAt(0).toUpperCase() + type.slice(1);
                const periodUnit = isYearly ? 'year' : 'month';
                candidates.push({
                    priority: SummaryPriority.TREND,
                    text: `${name} spending has increased for three consecutive ${periodUnit}s.`,
                    type: 'trend'
                });
                trendFound = true;
            }
        });

        if (!trendFound) {
            if (p1.savings < p2.savings && p2.savings < p3.savings) {
                const periodUnit = isYearly ? 'year' : 'month';
                candidates.push({
                    priority: SummaryPriority.TREND,
                    text: `Savings have decreased for three consecutive ${periodUnit}s.`,
                    type: 'trend'
                });
            }
        }
    }

    // --- 6. Reconciliation Hint (Priority 6) ---
    const variances = candidates.filter(c => c.type === 'variance');
    const over = variances.find(c => c.text.includes('more than planned'));
    const under = variances.find(c => c.text.includes('less than planned') || c.text.includes('less than target'));

    if (over && under) {
        const hint = `Lower ${under.group} spending offset some of the ${over.group} overspend.`;
        candidates.push({
            priority: SummaryPriority.RECONCILIATION,
            text: hint,
            type: 'repro'
        });
    }

    // --- SELECTION LOGIC ---
    let sorted = candidates.sort((a, b) => a.priority - b.priority);

    const varianceCandidates = sorted.filter(c => c.type === 'variance');
    if (varianceCandidates.length > 2) {
        const byMag = varianceCandidates.sort((a, b) => (b.magnitude || 0) - (a.magnitude || 0));
        const keep = new Set(byMag.slice(0, 2));
        sorted = sorted.filter(c => c.type !== 'variance' || keep.has(c));
    }

    const trend = sorted.find(c => c.type === 'trend');
    if (trend) {
        const v = sorted.filter(c => c.type === 'variance').sort((a, b) => b.priority - a.priority);
        if (v.length > 0) {
            const toRemove = v[0];
            sorted = sorted.filter(c => c !== toRemove);
        }
    }

    const savingsHealth = sorted.find(c => c.type === 'savings');
    if (savingsHealth && savingsHealth.text.includes('fell')) {
        sorted = sorted.filter(c => !(c.type === 'variance' && c.group === 'Savings' && c.text.includes('exceeded plan')));
    }

    if (sorted.length > 6) {
        sorted = sorted.slice(0, 6);
    }

    return sorted.map(c => c.text);
};
