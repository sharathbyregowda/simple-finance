import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Edit2, Check, X, RefreshCw, CalendarDays, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import type { RecurringTransaction } from '../types';
import { ExpenseCategory } from '../types';
import './Dashboard.css';

const RecurringManager: React.FC = () => {
    const {
        data,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        getCategoryHierarchy,
    } = useFinance();

    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state for income
    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeSource, setIncomeSource] = useState('');
    const [incomeDayOfMonth, setIncomeDayOfMonth] = useState('1');

    // Form state for expense
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseCategoryValue, setExpenseCategoryValue] = useState(''); // Combined categoryId:subcategoryId

    const [expenseDayOfMonth, setExpenseDayOfMonth] = useState('1');

    // Edit form state
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDayOfMonth, setEditDayOfMonth] = useState('');

    const recurringTransactions = data.recurringTransactions || [];

    // Separate income and expense transactions
    const incomeTransactions = recurringTransactions.filter(rt => rt.type === 'income');
    const expenseTransactions = recurringTransactions.filter(rt => rt.type === 'expense');

    const incomeSources = data.customCategories.filter(cat => cat.type === 'income');
    const hierarchy = getCategoryHierarchy();

    // Helper to parse the combined category value
    const parseCategoryValue = (value: string) => {
        if (!value) return { categoryId: '', subcategoryId: undefined };
        const [catId, subId] = value.split(':');
        return { categoryId: catId, subcategoryId: subId || undefined };
    };

    const handleAddIncome = (e: React.FormEvent) => {
        e.preventDefault();
        if (!incomeAmount || !incomeSource) return;

        addRecurringTransaction({
            type: 'income',
            amount: parseFloat(incomeAmount),
            source: incomeSource,
            frequency: 'monthly',
            dayOfMonth: parseInt(incomeDayOfMonth),
            isActive: true,
        });

        setIncomeAmount('');
        setIncomeSource('');
        setIncomeDayOfMonth('1');
        setIsAddingIncome(false);
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseAmount || !expenseCategoryValue) return;

        const { categoryId, subcategoryId } = parseCategoryValue(expenseCategoryValue);

        addRecurringTransaction({
            type: 'expense',
            amount: parseFloat(expenseAmount),
            description: expenseDescription,
            categoryId,
            subcategoryId,
            frequency: 'monthly',
            dayOfMonth: parseInt(expenseDayOfMonth),
            isActive: true,
        });

        setExpenseAmount('');
        setExpenseDescription('');
        setExpenseCategoryValue('');
        setExpenseDayOfMonth('1');
        setIsAddingExpense(false);
    };

    const handleEdit = (rt: RecurringTransaction) => {
        setEditingId(rt.id);
        setEditAmount(rt.amount.toString());
        setEditDescription(rt.description || rt.source || '');
        setEditDayOfMonth(rt.dayOfMonth.toString());
    };

    const handleSaveEdit = (rt: RecurringTransaction) => {
        updateRecurringTransaction(rt.id, {
            amount: parseFloat(editAmount),
            ...(rt.type === 'income' ? { source: editDescription } : { description: editDescription }),
            dayOfMonth: parseInt(editDayOfMonth),
        });
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this recurring transaction? Already-created transactions will not be affected.')) {
            deleteRecurringTransaction(id);
        }
    };

    const handleToggleActive = (rt: RecurringTransaction) => {
        updateRecurringTransaction(rt.id, { isActive: !rt.isActive });
    };

    const getCategoryName = (categoryId: string, subcategoryId?: string) => {
        const cat = data.customCategories.find(c => c.id === categoryId);
        const sub = subcategoryId ? data.customCategories.find(c => c.id === subcategoryId) : null;
        if (!cat) return 'Unknown';
        if (sub) {
            return `${cat.icon || ''} ${cat.name} → ${sub.icon || ''} ${sub.name}`;
        }
        return `${cat.icon || ''} ${cat.name}`;
    };

    const renderExpenseCategoryOptions = () => {
        return (
            <>
                <option value="">Select Category...</option>
                {[ExpenseCategory.NEEDS, ExpenseCategory.WANTS, ExpenseCategory.SAVINGS].map((type) => {
                    const typeHierarchy = hierarchy.filter((h) => h.category.type === type);
                    const label = type === 'needs' ? 'Needs (50%)' : type === 'wants' ? 'Wants (30%)' : 'Savings (20%)';

                    if (typeHierarchy.length === 0) return null;

                    return (
                        <optgroup key={type} label={label}>
                            {typeHierarchy.map(({ category, subcategories }) => (
                                <React.Fragment key={category.id}>
                                    <option value={category.id}>
                                        {category.icon} {category.name}
                                    </option>
                                    {subcategories.map((sub) => (
                                        <option key={sub.id} value={`${category.id}:${sub.id}`}>
                                            &nbsp;&nbsp;&nbsp;↳ {sub.icon} {sub.name}
                                        </option>
                                    ))}
                                </React.Fragment>
                            ))}
                        </optgroup>
                    );
                })}
            </>
        );
    };

    const getDayLabel = (day: number) => {
        if (day === 1) return '1st';
        if (day === 2) return '2nd';
        if (day === 3) return '3rd';
        if (day >= 4 && day <= 20) return `${day}th`;
        if (day === 21) return '21st';
        if (day === 22) return '22nd';
        if (day === 23) return '23rd';
        return `${day}th`;
    };

    const renderTransactionItem = (rt: RecurringTransaction) => {
        const isEditing = editingId === rt.id;
        const isIncome = rt.type === 'income';

        return (
            <div
                key={rt.id}
                className="recurring-item"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--spacing-md)',
                    borderRadius: '8px',
                    background: rt.isActive ? 'var(--bg-card-secondary)' : 'rgba(156, 163, 175, 0.1)',
                    marginBottom: 'var(--spacing-sm)',
                    opacity: rt.isActive ? 1 : 0.6,
                }}
            >
                {isEditing ? (
                    <div style={{ flex: 1, display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                        <input
                            type="text"
                            className="input"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder={isIncome ? 'Source' : 'Description'}
                            style={{ flex: 1 }}
                        />
                        <input
                            type="number"
                            className="input"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            style={{ width: '80px' }}
                        />
                        <select
                            className="select"
                            value={editDayOfMonth}
                            onChange={(e) => setEditDayOfMonth(e.target.value)}
                            style={{ width: '80px' }}
                        >
                            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                <option key={day} value={day}>{getDayLabel(day)}</option>
                            ))}
                        </select>
                        <button className="btn-icon" onClick={() => handleSaveEdit(rt)} title="Save">
                            <Check size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => setEditingId(null)} title="Cancel">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>
                                {isIncome ? rt.source : (rt.description || getCategoryName(rt.categoryId!))}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
                                <CalendarDays size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                {getDayLabel(rt.dayOfMonth)} of each month
                                {!isIncome && rt.categoryId && (
                                    <span> · {getCategoryName(rt.categoryId, rt.subcategoryId)}</span>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <span style={{
                                fontWeight: 600,
                                color: isIncome ? 'var(--color-success)' : 'inherit'
                            }}>
                                {isIncome ? '+' : '-'}{formatCurrency(rt.amount, data.currency)}
                            </span>
                            <button
                                className="btn-icon"
                                onClick={() => handleToggleActive(rt)}
                                title={rt.isActive ? 'Pause' : 'Resume'}
                                style={{ color: rt.isActive ? 'var(--color-success)' : 'var(--color-muted)' }}
                            >
                                {rt.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            </button>
                            <button className="btn-icon" onClick={() => handleEdit(rt)} title="Edit">
                                <Edit2 size={16} />
                            </button>
                            <button className="btn-icon" onClick={() => handleDelete(rt.id)} title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="recurring-manager" style={{ padding: 'var(--spacing-lg)' }}>
            {/* Header */}
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="icon-wrapper" style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <RefreshCw size={24} color="white" />
                </div>
                <div>
                    <h2 style={{ margin: 0 }}>Recurring Transactions</h2>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                        Set up transactions that repeat monthly
                    </p>
                </div>
            </div>

            {/* Recurring Income Section */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h3 style={{ margin: 0, color: 'var(--color-success)' }}>💰 Recurring Income</h3>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsAddingIncome(!isAddingIncome)}
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>

                {isAddingIncome && (
                    <form onSubmit={handleAddIncome} className="animate-fade-in" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <select
                                className="select"
                                value={incomeSource}
                                onChange={(e) => setIncomeSource(e.target.value)}
                                required
                            >
                                <option value="">Select Source</option>
                                {incomeSources.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                className="input"
                                placeholder="Amount"
                                value={incomeAmount}
                                onChange={(e) => setIncomeAmount(e.target.value)}
                                step="0.01"
                                required
                            />
                            <select
                                className="select"
                                value={incomeDayOfMonth}
                                onChange={(e) => setIncomeDayOfMonth(e.target.value)}
                            >
                                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{getDayLabel(day)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary">Add Income</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsAddingIncome(false)}>Cancel</button>
                        </div>
                    </form>
                )}

                {incomeTransactions.length === 0 ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                        No recurring income set up yet
                    </p>
                ) : (
                    incomeTransactions.map(renderTransactionItem)
                )}
            </div>

            {/* Recurring Expenses Section */}
            <div className="card">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h3 style={{ margin: 0 }}>📅 Recurring Expenses</h3>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsAddingExpense(!isAddingExpense)}
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>

                {isAddingExpense && (
                    <form onSubmit={handleAddExpense} className="animate-fade-in" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <select
                                className="select"
                                value={expenseCategoryValue}
                                onChange={(e) => setExpenseCategoryValue(e.target.value)}
                                required
                            >
                                {renderExpenseCategoryOptions()}
                            </select>
                            <input
                                type="text"
                                className="input"
                                placeholder="Description (optional)"
                                value={expenseDescription}
                                onChange={(e) => setExpenseDescription(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <input
                                type="number"
                                className="input"
                                placeholder="Amount"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                step="0.01"
                                required
                            />
                            <select
                                className="select"
                                value={expenseDayOfMonth}
                                onChange={(e) => setExpenseDayOfMonth(e.target.value)}
                            >
                                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{getDayLabel(day)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary">Add Expense</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsAddingExpense(false)}>Cancel</button>
                        </div>
                    </form>
                )}

                {expenseTransactions.length === 0 ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                        No recurring expenses set up yet
                    </p>
                ) : (
                    expenseTransactions.map(renderTransactionItem)
                )}
            </div>

            {/* Summary */}
            {recurringTransactions.length > 0 && (
                <div className="card" style={{ marginTop: 'var(--spacing-lg)', background: 'var(--bg-card-secondary)' }}>
                    <h4 style={{ margin: '0 0 var(--spacing-md) 0' }}>Monthly Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)', textAlign: 'center' }}>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8125rem' }}>Recurring Income</div>
                            <div style={{ fontWeight: 600, color: 'var(--color-success)', fontSize: '1.25rem' }}>
                                +{formatCurrency(
                                    incomeTransactions.filter(rt => rt.isActive).reduce((sum, rt) => sum + rt.amount, 0),
                                    data.currency
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8125rem' }}>Recurring Expenses</div>
                            <div style={{ fontWeight: 600, color: 'var(--color-danger)', fontSize: '1.25rem' }}>
                                -{formatCurrency(
                                    expenseTransactions.filter(rt => rt.isActive).reduce((sum, rt) => sum + rt.amount, 0),
                                    data.currency
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8125rem' }}>Net Recurring</div>
                            <div style={{
                                fontWeight: 600,
                                fontSize: '1.25rem',
                                color: (
                                    incomeTransactions.filter(rt => rt.isActive).reduce((sum, rt) => sum + rt.amount, 0) -
                                    expenseTransactions.filter(rt => rt.isActive).reduce((sum, rt) => sum + rt.amount, 0)
                                ) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                            }}>
                                {formatCurrency(
                                    incomeTransactions.filter(rt => rt.isActive).reduce((sum, rt) => sum + rt.amount, 0) -
                                    expenseTransactions.filter(rt => rt.isActive).reduce((sum, rt) => sum + rt.amount, 0),
                                    data.currency
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecurringManager;
