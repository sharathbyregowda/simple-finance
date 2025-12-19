import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMonth, calculateMonthlyTrends } from '../utils/calculations';
import IncomeForm from './IncomeForm';
import ExpenseLedger from './ExpenseLedger';
import ReportTabs from './ReportTabs';
import FinancialJourney from './FinancialJourney';
import CategoryBreakdown from './CategoryBreakdown';
import SavingsSummary from './SavingsSummary';
import MonthlySummary from './MonthlySummary';
import YearlySummary from './YearlySummary';
import CategoryManager from './CategoryManager';
import Settings from './Settings';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { data, budgetSummary, setCurrentMonth } = useFinance();

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header animate-fade-in">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="dashboard-title">Simple Finance</h1>
                            <p className="dashboard-subtitle">
                                Family Financial Planning with the 50/30/20 Rule
                            </p>
                        </div>
                        <div className="month-selector-container">
                            <label className="label" style={{ marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
                                View Month:
                            </label>
                            <select
                                className="select"
                                value={data.currentMonth}
                                onChange={(e) => setCurrentMonth(e.target.value)}
                                style={{ minWidth: '160px' }}
                            >
                                {(() => {
                                    const months = Array.from(
                                        new Set([
                                            ...data.expenses.map((e) => e.month),
                                            ...data.incomes.map((i) => i.month),
                                            data.currentMonth,
                                        ])
                                    ).filter((m) => !m.endsWith('-ALL'));

                                    const years = Array.from(new Set(months.map((m) => m.split('-')[0])));
                                    years.forEach((year) => months.push(`${year}-ALL`));

                                    return months
                                        .sort((a, b) => b.localeCompare(a))
                                        .map((month) => (
                                            <option key={month} value={month}>
                                                {formatMonth(month)}
                                            </option>
                                        ));
                                })()}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {/* Monthly Summary - Text based */}
                    <div className="col-span-12 monthly-summary-container">
                        <MonthlySummary />
                        <YearlySummary />
                    </div>

                    {/* Summary Cards */}
                    <SavingsSummary />

                    {/* Report Tabs (Budget Overview & Income vs Expenses) */}
                    <ReportTabs />

                    {/* Financial Journey - Only shown in Yearly View */}
                    {data.currentMonth.endsWith('-ALL') && (
                        <FinancialJourney
                            data={calculateMonthlyTrends(data.incomes, data.expenses)}
                            expenses={data.expenses}
                            categories={data.customCategories}
                            currentMonth={data.currentMonth}
                            budgetSummary={budgetSummary}
                            cashBalance={budgetSummary.unallocatedCash}
                        />
                    )}

                    {/* Category Breakdown */}
                    <CategoryBreakdown />

                    {/* Income and Expense Forms */}
                    <IncomeForm />

                    {/* Expense Ledger */}
                    <ExpenseLedger />

                    {/* Settings */}
                    <Settings />

                    {/* Category Manager */}
                    <CategoryManager />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
