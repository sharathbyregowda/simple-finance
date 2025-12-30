import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateMonthlyTrends } from '../utils/calculations';
import MonthlySummary from '../components/MonthlySummary';
import YearlySummary from '../components/YearlySummary';
import SavingsSummary from '../components/SavingsSummary';
import IfThisContinues from '../components/IfThisContinues';
import FinancialJourney from '../components/FinancialJourney';
import ApplyRecurring from '../components/ApplyRecurring';
import '../components/Dashboard.css';

const DashboardPage: React.FC = () => {
    const { data, budgetSummary } = useFinance();
    const isYearly = data.currentMonth.endsWith('-ALL');

    return (
        <div className="space-y-6">
            <header className="page-header">
                <h2 className="page-title">Dashboard</h2>
                <p className="page-subtitle">Your financial health at a glance.</p>
            </header>

            <div className="dashboard-grid">
                {/* Pending Recurring Transactions Widget */}
                {!isYearly && <ApplyRecurring month={data.currentMonth} />}

                {/* 1. Savings Summary Cards (Top Priority as requested) */}
                <SavingsSummary />

                {/* 2. Monthly/Yearly Summary Text */}
                <div className="monthly-summary-container">
                    <MonthlySummary />
                    <YearlySummary />
                </div>

                {/* 3. Projections - Unified View (No Tabs) */}
                {!isYearly && (
                    <div className="projections-container">
                        <IfThisContinues />
                    </div>
                )}

                {/* Financial Journey (Yearly Only) */}
                {isYearly && (
                    <>
                        <div className="financial-journey-container">
                            <FinancialJourney
                                data={calculateMonthlyTrends(data.incomes, data.expenses)}
                                expenses={data.expenses}
                                categories={data.customCategories}
                                currentMonth={data.currentMonth}
                                budgetSummary={budgetSummary}
                                cashBalance={budgetSummary.unallocatedCash}
                            />
                        </div>
                        <div className="projections-container">
                            <IfThisContinues />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
