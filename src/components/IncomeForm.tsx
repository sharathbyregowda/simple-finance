import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import './Dashboard.css';

const IncomeForm: React.FC = () => {
    const { addIncome, updateIncome, deleteIncome, data, setCurrentMonth } = useFinance();
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editSource, setEditSource] = useState('');
    const [editDate, setEditDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !source) return;

        addIncome({
            amount: parseFloat(amount),
            source,
            date,
        });

        // Auto-switch to the month of the new income if different
        const incomeMonth = date.substring(0, 7);
        const incomeYear = incomeMonth.split('-')[0];

        // If currently in yearly view for this year, don't switch
        if (data.currentMonth === `${incomeYear}-ALL`) {
            // Do nothing, stay in yearly view
        } else if (incomeMonth !== data.currentMonth) {
            setCurrentMonth(incomeMonth);
        }

        setAmount('');
        setSource('');
        setDate(new Date().toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const handleEdit = (income: any) => {
        setEditingId(income.id);
        setEditAmount(income.amount.toString());
        setEditSource(income.source);
        setEditDate(income.date);
    };

    const handleSaveEdit = (id: string) => {
        updateIncome(id, {
            amount: parseFloat(editAmount),
            source: editSource,
            date: editDate,
        });
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this income entry?')) {
            deleteIncome(id);
        }
    };

    const currentMonthIncomes = data.incomes.filter(
        (income) => income.month === data.currentMonth
    );

    return (
        <div className="card income-form-card">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3>Monthly Income</h3>
                <button className="btn btn-primary" onClick={() => setIsOpen(!isOpen)}>
                    <Plus size={18} />
                    Add Income
                </button>
            </div>

            {isOpen && (
                <form onSubmit={handleSubmit} className="animate-fade-in" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="form-group">
                        <label className="label">Amount</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Source</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Salary, Freelance"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Date</label>
                        <input
                            type="date"
                            className="input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-sm">
                        <button type="submit" className="btn btn-primary">
                            Add Income
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {currentMonthIncomes.length > 0 && (
                <div className="income-list">
                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Current Month</h4>
                    {currentMonthIncomes.map((income) => (
                        <div key={income.id} className="income-item">
                            {editingId === income.id ? (
                                <div className="income-edit-form">
                                    <input
                                        type="number"
                                        className="input"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        step="0.01"
                                        style={{ marginBottom: 'var(--spacing-sm)' }}
                                    />
                                    <input
                                        type="text"
                                        className="input"
                                        value={editSource}
                                        onChange={(e) => setEditSource(e.target.value)}
                                        style={{ marginBottom: 'var(--spacing-sm)' }}
                                    />
                                    <input
                                        type="date"
                                        className="input"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        style={{ marginBottom: 'var(--spacing-sm)' }}
                                    />
                                    <div className="flex gap-sm">
                                        <button className="btn-icon" onClick={() => handleSaveEdit(income.id)} title="Save">
                                            <Check size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={handleCancelEdit} title="Cancel">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <div className="income-source">{income.source}</div>
                                        <div className="income-date">{new Date(income.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="income-actions">
                                        <div className="income-amount">{formatCurrency(income.amount, data.currency)}</div>
                                        <button className="btn-icon" onClick={() => handleEdit(income)} title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDelete(income.id)} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IncomeForm;
