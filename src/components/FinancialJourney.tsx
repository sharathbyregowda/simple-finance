
import React, { useMemo } from 'react';
import { calculateJourneyStats, getFinancialPersona } from '../utils/journey';
import { calculateCategoryBreakdown } from '../utils/calculations';
import type { MonthlyData, Expense, CustomCategory } from '../types';

interface FinancialJourneyProps {
    data: MonthlyData[];
    expenses: Expense[];
    categories: CustomCategory[];
    currentMonth: string;
}

const FinancialJourney: React.FC<FinancialJourneyProps> = ({ data, expenses, categories, currentMonth }) => {
    // Only show if we have more than 3 months of data (user requirement)
    if (!data || data.length < 3) {
        return null;
    }

    const stats = calculateJourneyStats(data);
    const persona = getFinancialPersona(stats);

    // Calculate Top 3 for each type
    const topCategories = useMemo(() => {
        const breakdown = calculateCategoryBreakdown(expenses, categories, currentMonth);

        const getTop3 = (type: string) => {
            return breakdown
                .filter(item => item.categoryType === type)
                .slice(0, 3);
        };

        return {
            needs: getTop3('needs'),
            wants: getTop3('wants'),
            savings: getTop3('savings'),
        };
    }, [expenses, categories, currentMonth]);

    const BentoCard = ({ title, value, color, icon, items, subtitle }: { title: string, value: number, color: string, icon: React.ReactNode, items: typeof topCategories.needs, subtitle?: string }) => (
        <div className="flex flex-col h-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Header / Top Section */}
            <div className="p-5 flex flex-col gap-3 relative overflow-hidden">
                {/* Background accent */}
                <div style={{ backgroundColor: color, opacity: 0.1 }} className="absolute inset-0 pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm dark:bg-black/20 text-xl">
                            {icon}
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">{title}</h4>
                            {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
                        </div>
                    </div>
                    <span className="text-3xl font-bold tracking-tight" style={{ color }}>
                        {Math.round(value)}%
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden w-full mt-2 z-10">
                    <div
                        className="h-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, backgroundColor: color }}
                    />
                </div>
            </div>

            {/* Content / List Section */}
            <div className="p-5 pt-2 flex-grow flex flex-col">
                <div className="mt-2 space-y-3">
                    <p className="text-xs uppercase tracking-wider opacity-50 font-semibold mb-3">Top Contributors</p>
                    {items.length > 0 ? (
                        items.map(item => (
                            <div key={item.categoryId} className="flex justify-between items-center text-sm group">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                                    <span className="truncate opacity-80 group-hover:opacity-100 transition-opacity">
                                        {item.categoryName}
                                    </span>
                                </div>
                                <span className="font-mono font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                                    {Math.round(item.percentage)}%
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm opacity-50 italic py-2">No expenses yet</div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="card financial-journey-card mt-8 p-0 border-none shadow-none bg-transparent">
            {/* Header Section */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    <span>🏔️</span> Your Financial Journey
                </h3>
                <p className="text-muted">
                    Based on your activity over the last {data.length} months.
                    Monitor your 50/30/20 balance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Persona Section - Full Width or Large */}
                <div className="md:col-span-12 p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border-color)] relative overflow-hidden group">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-current opacity-5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" style={{ color: persona.color }} />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-16 h-16 flex items-center justify-center rounded-2xl text-4xl bg-white dark:bg-black/20 shadow-sm border border-[var(--border-color)]">
                            {persona.icon}
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-2xl mb-1" style={{ color: persona.color }}>
                                {persona.title}
                            </h4>
                            <p className="text-base opacity-90 leading-relaxed max-w-2xl">
                                {persona.description}
                            </p>
                        </div>
                        <div className="md:w-1/3 bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-[var(--border-color)/50] backdrop-blur-sm self-stretch flex items-start">
                            <div className="flex gap-3">
                                <span className="text-lg">💡</span>
                                <p className="text-sm italic opacity-80 leading-snug">
                                    {persona.recommendation}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Bento Grid Row */}
                <div className="md:col-span-4">
                    <BentoCard
                        title="Needs"
                        subtitle="Target: 50%"
                        value={stats.needsPercentage}
                        color="#F59E0B"
                        icon={<span>🏠</span>}
                        items={topCategories.needs}
                    />
                </div>
                <div className="md:col-span-4">
                    <BentoCard
                        title="Wants"
                        subtitle="Target: 30%"
                        value={stats.wantsPercentage}
                        color="#A855F7"
                        icon={<span>🎮</span>}
                        items={topCategories.wants}
                    />
                </div>
                <div className="md:col-span-4">
                    <BentoCard
                        title="Savings"
                        subtitle="Target: 20%"
                        value={stats.savingsPercentage}
                        color="#10B981"
                        icon={<span>🌱</span>}
                        items={topCategories.savings}
                    />
                </div>
            </div>
        </div>
    );
};

export default FinancialJourney;
