import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, TrendingUp, PiggyBank, Target } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import './Dashboard.css';

const SavingsSummary: React.FC = () => {
    const { budgetSummary, data } = useFinance(); // Added 'data' to destructuring to access data.currency

    const savingsRate = budgetSummary.totalIncome > 0
        ? ((budgetSummary.netSavings / budgetSummary.totalIncome) * 100).toFixed(1)
        : '0';

    const cards = [
        {
            title: 'Total Income',
            value: formatCurrency(budgetSummary.totalIncome, data.currency),
            icon: <Wallet size={24} />,
            color: '#10B981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(budgetSummary.totalExpenses, data.currency),
            icon: <TrendingUp size={24} />,
            color: '#EF4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
        },
        {
            title: 'Net Savings',
            value: formatCurrency(budgetSummary.netSavings, data.currency),
            icon: <PiggyBank size={24} />,
            color: '#3B82F6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
            title: 'Savings Rate',
            value: `${savingsRate}%`,
            icon: <Target size={24} />,
            color: '#A855F7',
            bgColor: 'rgba(168, 85, 247, 0.1)',
        },
    ];

    return (
        <div className="savings-summary-grid">
            {cards.map((card, index) => (
                <div key={index} className="card summary-card" style={{ padding: 'var(--spacing-lg)' }}>
                    <div className="summary-card-header">
                        <div className="summary-icon" style={{ background: card.bgColor, color: card.color }}>
                            {card.icon}
                        </div>
                    </div>
                    <div className="summary-card-content">
                        <div className="summary-title">{card.title}</div>
                        <div className="summary-value" style={{ color: card.color }}>
                            {card.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SavingsSummary;
