import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { RefreshCw, Check, X } from 'lucide-react';
import { formatCurrency, getCurrentMonth } from '../utils/calculations';
import './Dashboard.css';

interface ApplyRecurringProps {
    month?: string;
}

const ApplyRecurring: React.FC<ApplyRecurringProps> = ({ month }) => {
    const {
        data,
        getPendingRecurringTransactions,
        applyRecurringTransactions,
        updateRecurringTransaction,
    } = useFinance();

    const targetMonth = month || getCurrentMonth();
    const pending = getPendingRecurringTransactions(targetMonth);

    if (pending.length === 0) {
        return null; // Don't render if nothing pending
    }

    const handleApplyAll = () => {
        const { applied, skipped } = applyRecurringTransactions(targetMonth);
        if (applied > 0) {
            alert(`Applied ${applied} recurring transaction${applied !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped due to errors)` : ''}`);
        }
    };

    const handleSkipAll = () => {
        if (window.confirm('Skip all pending recurring transactions for this month?')) {
            pending.forEach(rt => {
                updateRecurringTransaction(rt.id, { lastAppliedMonth: targetMonth });
            });
        }
    };

    const handleSkipOne = (id: string) => {
        updateRecurringTransaction(id, { lastAppliedMonth: targetMonth });
    };

    const getCategoryName = (categoryId: string) => {
        const cat = data.customCategories.find(c => c.id === categoryId);
        return cat ? cat.name : 'Unknown';
    };

    const totalIncome = pending.filter(p => p.type === 'income').reduce((sum, p) => sum + p.amount, 0);
    const totalExpense = pending.filter(p => p.type === 'expense').reduce((sum, p) => sum + p.amount, 0);

    const monthName = new Date(targetMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="card apply-recurring" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
        }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RefreshCw size={20} style={{ color: 'var(--color-primary)' }} />
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>Pending Recurring Transactions</h4>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.8125rem' }}>
                        {pending.length} transaction{pending.length !== 1 ? 's' : ''} ready to apply for {monthName}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                {pending.map(rt => (
                    <div
                        key={rt.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--spacing-sm)',
                            borderBottom: '1px solid var(--border-color)',
                        }}
                    >
                        <div>
                            <span style={{ fontWeight: 500 }}>
                                {rt.type === 'income' ? rt.source : (rt.description || getCategoryName(rt.categoryId!))}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{
                                fontWeight: 600,
                                color: rt.type === 'income' ? 'var(--color-success)' : 'inherit'
                            }}>
                                {rt.type === 'income' ? '+' : '-'}{formatCurrency(rt.amount, data.currency)}
                            </span>
                            <button
                                className="btn-icon"
                                onClick={() => handleSkipOne(rt.id)}
                                title="Skip this month"
                                style={{ color: 'var(--color-muted)' }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-sm)',
                background: 'var(--bg-card-secondary)',
                borderRadius: '6px',
                marginBottom: 'var(--spacing-md)',
            }}>
                <span className="text-muted">Net Impact:</span>
                <span style={{
                    fontWeight: 600,
                    color: (totalIncome - totalExpense) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                }}>
                    {formatCurrency(totalIncome - totalExpense, data.currency)}
                </span>
            </div>

            <div className="flex gap-sm">
                <button className="btn btn-primary" onClick={handleApplyAll} style={{ flex: 1 }}>
                    <Check size={16} />
                    Apply All
                </button>
                <button className="btn btn-secondary" onClick={handleSkipAll}>
                    Skip All
                </button>
            </div>
        </div>
    );
};

export default ApplyRecurring;
