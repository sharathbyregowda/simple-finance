import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/calculations';
import './Dashboard.css';

const ExpenseLedger: React.FC = () => {
    const { addExpense, updateExpense, deleteExpense, data, getCategoryHierarchy, setCurrentMonth } = useFinance();

    // Input State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryValue, setCategoryValue] = useState(''); // Combined ID for Category/Subcategory
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategoryValue, setEditCategoryValue] = useState('');
    const [editDate, setEditDate] = useState('');

    // Refs for focus management
    const amountInputRef = useRef<HTMLInputElement>(null);

    const hierarchy = getCategoryHierarchy();

    // Helper to parse the combined category value
    const parseCategoryValue = (value: string) => {
        if (!value) return { categoryId: '', subcategoryId: undefined };
        const [catId, subId] = value.split(':');
        return { categoryId: catId, subcategoryId: subId || undefined };
    };

    // Helper to create the combined category value
    const createCategoryValue = (catId: string, subId?: string) => {
        return subId ? `${catId}:${subId}` : catId;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryValue) return;

        const { categoryId, subcategoryId } = parseCategoryValue(categoryValue);

        addExpense({
            amount: parseFloat(amount),
            description: description || '',
            categoryId,
            subcategoryId,
            date,
        });

        // Auto-switch logic
        const expenseMonth = date.substring(0, 7);
        const expenseYear = expenseMonth.split('-')[0];

        if (data.currentMonth !== `${expenseYear}-ALL` && expenseMonth !== data.currentMonth) {
            setCurrentMonth(expenseMonth);
        }

        // Reset fields but keep date for rapid entry of same-day receipts
        setAmount('');
        setDescription('');
        setCategoryValue('');
        // Date intentionally NOT reset to today

        // Focus back to amount for rapid entry
        if (amountInputRef.current) {
            amountInputRef.current.focus();
        }
    };

    const handleEdit = (expense: any) => {
        setEditingId(expense.id);
        setEditAmount(expense.amount.toString());
        setEditDescription(expense.description);
        setEditCategoryValue(createCategoryValue(expense.categoryId, expense.subcategoryId));
        setEditDate(expense.date);
    };

    const handleSaveEdit = (id: string) => {
        if (!editAmount || !editCategoryValue) return;

        const { categoryId, subcategoryId } = parseCategoryValue(editCategoryValue);

        updateExpense(id, {
            amount: parseFloat(editAmount),
            description: editDescription || '',
            categoryId,
            subcategoryId,
            date: editDate,
        });
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this expense?')) {
            deleteExpense(id);
        }
    };

    const renderCategoryOptions = () => {
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

    const currentMonthExpenses = data.expenses
        .filter((expense) => {
            if (data.currentMonth.endsWith('-ALL')) {
                const year = data.currentMonth.split('-')[0];
                return expense.month.startsWith(year);
            }
            return expense.month === data.currentMonth;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="card ledger-card">
            <div className="flex justify-between items-center mb-4">
                <h3>Expense Ledger</h3>
                <div className="text-sm text-muted">
                    {currentMonthExpenses.length} entries
                </div>
            </div>

            <div className="ledger-container">
                <table className="ledger-table">
                    <thead>
                        <tr>
                            <th style={{ width: '130px' }}>Date</th>
                            <th style={{ width: '200px' }}>Category</th>
                            <th>Description</th>
                            <th style={{ width: '120px' }}>Amount</th>
                            <th style={{ width: '80px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Input Row - Always Visible */}
                        <tr className="ledger-input-row">
                            <td>
                                <input
                                    type="date"
                                    className="ledger-input"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </td>
                            <td>
                                <select
                                    className="ledger-select"
                                    value={categoryValue}
                                    onChange={(e) => setCategoryValue(e.target.value)}
                                    required
                                >
                                    {renderCategoryOptions()}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    className="ledger-input"
                                    placeholder="Description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSubmit(e);
                                    }}
                                />
                            </td>
                            <td>
                                <input
                                    ref={amountInputRef}
                                    type="number"
                                    className="ledger-input"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    step="0.01"
                                    required
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSubmit(e);
                                    }}
                                />
                            </td>
                            <td>
                                <button
                                    className="btn-icon btn-icon-primary"
                                    onClick={handleSubmit}
                                    disabled={!amount || !categoryValue}
                                    title="Add Entry (Enter)"
                                >
                                    <Plus size={18} />
                                </button>
                            </td>
                        </tr>

                        {/* Data Rows */}
                        {currentMonthExpenses.map((expense) => {
                            const isEditing = editingId === expense.id;
                            const category = data.customCategories.find(c => c.id === expense.categoryId);
                            const subcategory = expense.subcategoryId ? data.customCategories.find(c => c.id === expense.subcategoryId) : null;

                            if (isEditing) {
                                return (
                                    <tr key={expense.id} className="ledger-row editing">
                                        <td>
                                            <input
                                                type="date"
                                                className="ledger-input"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="ledger-select"
                                                value={editCategoryValue}
                                                onChange={(e) => setEditCategoryValue(e.target.value)}
                                            >
                                                {renderCategoryOptions()}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="ledger-input"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(expense.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="ledger-input"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                step="0.01"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(expense.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <div className="flex gap-xs">
                                                <button
                                                    className="btn-icon btn-icon-success"
                                                    onClick={() => handleSaveEdit(expense.id)}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={expense.id} className="ledger-row">
                                    <td className="text-sm text-muted">
                                        {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-xs">
                                            <span>{category?.icon}</span>
                                            <span className="text-sm font-medium">{category?.name}</span>
                                            {subcategory && (
                                                <>
                                                    <span className="text-muted text-xs">→</span>
                                                    <span>{subcategory.icon}</span>
                                                    <span className="text-sm text-muted">{subcategory.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-sm">{expense.description}</td>
                                    <td className="font-mono font-medium">
                                        {formatCurrency(expense.amount, data.currency)}
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEdit(expense)}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDelete(expense.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenseLedger;
