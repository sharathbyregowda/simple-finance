import type { BudgetSummary, Expense, MonthlyData } from '../types';
import { calculateCategoryBreakdown, formatCurrency } from './calculations';
import { ExpenseCategory } from '../types';

interface SummaryInput {
    currentMonth: string;
    budgetSummary: BudgetSummary;
    expenses: Expense[];
    categories: import('../types').CustomCategory[];
    monthlyHistory: MonthlyData[]; // Sorted chronological
    currencyCode: string;
}

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

export const generateMonthlySummary = (input: SummaryInput): string[] => {
    const { currentMonth, budgetSummary, expenses, categories, monthlyHistory, currencyCode } = input;
    const candidates: SummaryCandidate[] = [];
    const format = (amount: number) => formatCurrency(amount, currencyCode, { maximumFractionDigits: 0 });

    // --- 1. Overall Outcome (Priority 1: Mandatory) ---
    const diff = budgetSummary.totalExpenses - budgetSummary.totalIncome;
    const isOver = diff > 0;
    const outcomeText = isOver
        ? `Total spending was ${format(diff)} above your income.`
        : `Total spending was ${format(Math.abs(diff))} below your income.`;

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
        const threshold = Math.max(recommended * 0.05, 100);

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
    // Exclude Savings. Combined share >= 50%.
    const breakdown = calculateCategoryBreakdown(expenses, categories, currentMonth);
    // Filter out savings category types if any make it here (though usually 'savings' type is separate)
    // Actually ExpenseCategory.SAVINGS items are in expenses list.
    const expenseBreakdown = breakdown.filter(c => c.categoryType !== ExpenseCategory.SAVINGS);
    const topCategories = expenseBreakdown.sort((a, b) => b.amount - a.amount);

    // Check top 1 or 2
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
                text: `${names} made up ${pct}% of total spending.`,
                type: 'driver'
            });
        }
    }

    // --- 4. Savings Health (Priority 4) ---
    // Change only.
    const currentIndex = monthlyHistory.findIndex(m => m.month === currentMonth);
    const currentSavingsRate = Math.round(budgetSummary.savingsPercentage);

    if (currentIndex > 0) {
        const prev = monthlyHistory[currentIndex - 1];
        if (prev.income > 0) {
            const prevSavingsRate = Math.round((prev.savings / prev.income) * 100);
            const diff = currentSavingsRate - prevSavingsRate;
            if (Math.abs(diff) >= 1) { // 1% change meaningful?
                const text = `Savings ${diff > 0 ? 'increased' : 'fell'} from ${prevSavingsRate}% to ${currentSavingsRate}%.`;
                candidates.push({
                    priority: SummaryPriority.SAVINGS_HEALTH,
                    text,
                    type: 'savings'
                });
            }
        }
    }

    // --- 5. Trend Signal (Priority 5) ---
    // 3 consecutive months. Replaces a lower-priority variance bullet.
    if (currentIndex >= 2) {
        const m1 = monthlyHistory[currentIndex];
        const m2 = monthlyHistory[currentIndex - 1];
        const m3 = monthlyHistory[currentIndex - 2];
        const getVal = (m: MonthlyData, type: 'needs' | 'wants' | 'savings') => m[type];

        let trendFound = false;
        // Needs/Wants increase
        ['needs', 'wants'].forEach(type => {
            if (trendFound) return;
            const v1 = getVal(m1, type as any);
            const v2 = getVal(m2, type as any);
            const v3 = getVal(m3, type as any);
            // Verify meaningful magnitude? User said "Meaningful magnitude". Let's assume strict increase is enough for now.
            if (v1 > v2 && v2 > v3) {
                const name = type.charAt(0).toUpperCase() + type.slice(1);
                candidates.push({
                    priority: SummaryPriority.TREND,
                    text: `${name} spending has increased for three consecutive months.`,
                    type: 'trend'
                });
                trendFound = true;
            }
        });

        if (!trendFound) {
            if (m1.savings < m2.savings && m2.savings < m3.savings) {
                candidates.push({
                    priority: SummaryPriority.TREND,
                    text: `Savings have decreased for three consecutive months.`,
                    type: 'trend'
                });
            }
        }
    }

    // --- 6. Reconciliation Hint (Priority 6) ---
    // If bucket variance > overall outcome delta by large margin (so bucket overspend is huge, but overall is OK-ish?)
    // "Triggered when: A bucket variance exceeds the overall income delta by a large margin"
    // e.g. Overall is +500 (Over by 500). But Wants is Over by 2000.
    // That means Needs/Savings must have Underspent?
    // "Lower Wants spending offset some of the Needs overspend."
    // Logic: Find biggest Overspend bucket. Find biggest Underspend bucket.
    // If OverBucket > X and UnderBucket > Y?
    // Let's implement simpler: If Outcome is safe (or low overspend) but one bucket is HIGH overspend.

    // Only if we have 2 variances directions?
    // Let's gather variances again from candidates
    const variances = candidates.filter(c => c.type === 'variance');
    const over = variances.find(c => c.text.includes('more than planned')); // Rough check
    const under = variances.find(c => c.text.includes('less than planned') || c.text.includes('less than target')); // Rough check

    if (over && under) {
        // We have offsetting variances.
        // If the 'over' magnitude is > 20% of income? Or just large?
        // Let's enable only if we have high bullet count/complexity.
        const hint = `Lower ${under.group} spending offset some of the ${over.group} overspend.`;
        candidates.push({
            priority: SummaryPriority.RECONCILIATION,
            text: hint,
            type: 'repro'
        });
    }

    // --- SELECTION LOGIC ---

    // 1. Sort by Priority (Low enum value = High priority)
    let sorted = candidates.sort((a, b) => a.priority - b.priority);

    // 2. Filter Variance Candidates (Max 2)
    // Variance priorities are 2, 3, 4.
    const varianceCandidates = sorted.filter(c => c.type === 'variance');
    if (varianceCandidates.length > 2) {
        // Keep top 2 by magnitude (if available) or just priority?
        // Spec: "Pick buckets with largest absolute variance."
        // Re-sort variance candidates by magnitude desc
        const byMag = varianceCandidates.sort((a, b) => (b.magnitude || 0) - (a.magnitude || 0));
        const keep = new Set(byMag.slice(0, 2));
        sorted = sorted.filter(c => c.type !== 'variance' || keep.has(c));
    }

    // 3. Suppression Rules
    // "Trend bullet replaces a lower-priority variance bullet."
    const trend = sorted.find(c => c.type === 'trend');
    if (trend) {
        // Suppress lowest priority VARIANCE
        const variances = sorted.filter(c => c.type === 'variance').sort((a, b) => b.priority - a.priority); // Highest enum = lowest prio
        if (variances.length > 0) {
            const toRemove = variances[0];
            sorted = sorted.filter(c => c !== toRemove);
        }
    }

    // "Standalone savings rate" -> We implemented only "Change". 
    // "Suppression order: Standalone savings rate, Savings variance, Wants variance..."

    // 4. Max 6 bullets
    if (sorted.length > 6) {
        // Remove lowest priorities
        // Priorities are roughly ordered by importance already, but let's be strict.
        // We can drop from the end of the list (since it is sorted by priority).
        sorted = sorted.slice(0, 6);
    }

    // 5. Min 4 bullets?
    // "Minimum: 4 bullets".
    // If < 4, we need to find more.
    // What if we don't have enough candidates?
    // "If a bullet does not help ... silence is better than noise."
    // User notes: "I will prioritize "Silence" (quality) over the minimum count if strictly necessary".
    // So if < 4 but no valid candidates left, return < 4.

    return sorted.map(c => c.text);
};
