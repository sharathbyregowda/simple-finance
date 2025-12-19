import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatMonth } from '../utils/calculations';
import './Dashboard.css';

interface IncomeVsExpensesProps {
    standalone?: boolean;
}

const IncomeVsExpenses: React.FC<IncomeVsExpensesProps> = ({ standalone = true }) => {
    const { monthlyTrends } = useFinance();

    const chartData = monthlyTrends.map((data) => ({
        month: formatMonth(data.month).split(' ')[0], // Just the month name
        Income: data.income,
        Expenses: data.expenses,
        Savings: data.savings,
    }));

    const content = (
        <>
            {standalone && <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Income vs Expenses</h3>}

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        dataKey="month"
                        stroke="#94A3B8"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        stroke="#94A3B8"
                        style={{ fontSize: '0.75rem' }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                        contentStyle={{
                            background: 'rgba(30, 41, 59, 0.9)',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#F1F5F9',
                        }}
                    />
                    <Legend />
                    <Bar dataKey="Income" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Savings" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </>
    );

    if (!standalone) {
        return content;
    }

    return (
        <div className="card income-vs-expenses-card">
            {content}
        </div>
    );
};

export default IncomeVsExpenses;
