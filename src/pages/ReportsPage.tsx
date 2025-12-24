import React, { useState } from 'react';
import BudgetOverview from '../components/BudgetOverview';
import IncomeVsExpenses from '../components/IncomeVsExpenses';
import SavingsGoalCalculator from '../components/SavingsGoalCalculator';
import '../components/Dashboard.css';

type ReportType = 'budget' | 'trends' | 'savings';

const ReportsPage: React.FC = () => {
    const [activeReport, setActiveReport] = useState<ReportType>('budget');

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h2 className="text-2xl font-bold">Reports & Analysis</h2>
                <p className="text-muted">Deep dive into your financial data.</p>
            </header>

            {/* Page-level Tabs */}
            <div className="flex gap-4 border-b border-[var(--border-color)] mb-6">
                <button
                    onClick={() => setActiveReport('budget')}
                    className={`pb-3 px-2 font-medium transition-colors relative ${activeReport === 'budget'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-muted hover:text-white'
                        }`}
                >
                    🎯 Budget Goal
                </button>
                <button
                    onClick={() => setActiveReport('trends')}
                    className={`pb-3 px-2 font-medium transition-colors relative ${activeReport === 'trends'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-muted hover:text-white'
                        }`}
                >
                    📈 Trends
                </button>
                <button
                    onClick={() => setActiveReport('savings')}
                    className={`pb-3 px-2 font-medium transition-colors relative ${activeReport === 'savings'
                            ? 'text-emerald-400 border-b-2 border-emerald-400'
                            : 'text-muted hover:text-white'
                        }`}
                >
                    💰 Savings Goal
                </button>
            </div>

            {/* Report Content */}
            <div className="animate-fade-in">
                {activeReport === 'budget' && (
                    <div className="card report-tabs-card">
                        {/* Reusing existing component but allowing it to expand */}
                        <BudgetOverview standalone={false} />
                    </div>
                )}

                {activeReport === 'trends' && (
                    <div className="card report-tabs-card">
                        <IncomeVsExpenses standalone={false} />
                    </div>
                )}

                {activeReport === 'savings' && (
                    <div className="card max-w-2xl mx-auto">
                        <SavingsGoalCalculator />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
