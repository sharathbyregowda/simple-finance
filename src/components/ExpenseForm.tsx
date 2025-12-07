import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/calculations';
import './Dashboard.css';

const ExpenseForm: React.FC = () => {
    const { addExpense, updateExpense, deleteExpense, data, getCategoryHierarchy, setCurrentMonth } = useFinance();
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [subcategoryId, setSubcategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');
    const [editSubcategoryId, setEditSubcategoryId] = useState('');
    const [editDate, setEditDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId) return;

        addExpense({
            amount: parseFloat(amount),
            description: description || '',
            categoryId,
            subcategoryId: subcategoryId || undefined,
            date,
        });

        // Auto-switch to the month of the new expense if different
        const expenseMonth = date.substring(0, 7);
        const expenseYear = expenseMonth.split('-')[0];

        // If currently in yearly view for this year, don't switch
        if (data.currentMonth === `${expenseYear}-ALL`) {
            // Do nothing, stay in yearly view
        } else if (expenseMonth !== data.currentMonth) {
            setCurrentMonth(expenseMonth);
        }

        setAmount('');
        setDescription('');
        setCategoryId('');
        setSubcategoryId('');
        setDate(new Date().toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const handleEdit = (expense: any) => {
        setEditingId(expense.id);
        setEditAmount(expense.amount.toString());
        setEditDescription(expense.description);
        setEditCategoryId(expense.categoryId);
        setEditSubcategoryId(expense.subcategoryId || '');
        setEditDate(expense.date);
    };

    const handleSaveEdit = (id: string) => {
        if (!editAmount || !editCategoryId) return;

        updateExpense(id, {
            amount: parseFloat(editAmount),
            description: editDescription || '',
            categoryId: editCategoryId,
            subcategoryId: editSubcategoryId || undefined,
            date: editDate,
        });
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            deleteExpense(id);
        }
    };

    const currentMonthExpenses = data.expenses
        .filter((expense) => expense.month === data.currentMonth)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getCategoryById = (id: string) => {
        return data.customCategories.find((cat) => cat.id === id);
    };

    const hierarchy = getCategoryHierarchy();

    // Get subcategories for selected category
    const selectedCategorySubcategories = categoryId
        ? hierarchy.find((h) => h.category.id === categoryId)?.subcategories || []
        : [];

    const renderCategoryOptions = (type: ExpenseCategory, label: string) => {
        const typeHierarchy = hierarchy.filter((h) => h.category.type === type);

        return (
            <optgroup label={label}>
                {typeHierarchy.map(({ category, subcategories }) => (
                    <React.Fragment key={category.id}>
                        <option value={category.id}>
                            {category.icon} {category.name}
                        </option>
                        {subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id} className="subcategory-option">
                                {category.icon} {category.name} → {sub.icon} {sub.name}
                            </option>
                        ))}
                    </React.Fragment>
                ))}
            </optgroup>
        );
    };

    return (
        <div className="card expense-form-card">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3>Expenses</h3>
                <button className="btn btn-primary" onClick={() => setIsOpen(!isOpen)}>
                    <Plus size={18} />
                    Add Expense
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
                        <label className="label">Description (Optional)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Add details if needed (e.g., 'John's school fees')"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                            💡 Leave blank if category and subcategory are self-explanatory
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="label">Category</label>
                        <select
                            className="select"
                            value={categoryId}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                const selectedCategory = getCategoryById(selectedId);

                                // If selecting a subcategory, set both categoryId and subcategoryId
                                if (selectedCategory?.isSubcategory) {
                                    setCategoryId(selectedCategory.parentId || '');
                                    setSubcategoryId(selectedId);
                                } else {
                                    setCategoryId(selectedId);
                                    setSubcategoryId('');
                                }
                            }}
                            required
                        >
                            <option value="">Select a category</option>
                            {renderCategoryOptions(ExpenseCategory.NEEDS, 'Needs (50%)')}
                            {renderCategoryOptions(ExpenseCategory.WANTS, 'Wants (30%)')}
                            {renderCategoryOptions(ExpenseCategory.SAVINGS, 'Savings (20%)')}
                        </select>
                        {selectedCategorySubcategories.length > 0 && !subcategoryId && (
                            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)' }}>
                                💡 This category has subcategories. You can select a more specific one if needed.
                            </p>
                        )}
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
                            Add Expense
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {currentMonthExpenses.length > 0 && (
                <div className="expense-list">
                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Recent Expenses</h4>
                    {currentMonthExpenses.slice(0, 10).map((expense) => {
                        const category = getCategoryById(expense.categoryId);
                        const subcategory = expense.subcategoryId ? getCategoryById(expense.subcategoryId) : null;
                        const isEditing = editingId === expense.id;

                        return (
                            <div key={expense.id} className="expense-item">
                                {isEditing ? (
                                    // Edit mode
                                    <div className="expense-edit-form">
                                        <div className="expense-edit-row">
                                            <input
                                                type="number"
                                                className="input input-sm"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                step="0.01"
                                                style={{ width: '120px' }}
                                            />
                                            <input
                                                type="text"
                                                className="input input-sm"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                        <div className="expense-edit-row">
                                            <select
                                                className="select select-sm"
                                                value={editSubcategoryId || editCategoryId}
                                                onChange={(e) => {
                                                    const selectedId = e.target.value;
                                                    const selectedCategory = getCategoryById(selectedId);

                                                    if (selectedCategory?.isSubcategory) {
                                                        setEditCategoryId(selectedCategory.parentId || '');
                                                        setEditSubcategoryId(selectedId);
                                                    } else {
                                                        setEditCategoryId(selectedId);
                                                        setEditSubcategoryId('');
                                                    }
                                                }}
                                                style={{ flex: 1 }}
                                            >
                                                <option value="">Select a category</option>
                                                {renderCategoryOptions(ExpenseCategory.NEEDS, 'Needs (50%)')}
                                                {renderCategoryOptions(ExpenseCategory.WANTS, 'Wants (30%)')}
                                                {renderCategoryOptions(ExpenseCategory.SAVINGS, 'Savings (20%)')}
                                            </select>
                                            <input
                                                type="date"
                                                className="input input-sm"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                                style={{ width: '150px' }}
                                            />
                                        </div>
                                        <div className="expense-edit-actions">
                                            <button
                                                className="btn-icon btn-icon-success"
                                                onClick={() => handleSaveEdit(expense.id)}
                                                title="Save changes"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={handleCancelEdit}
                                                title="Cancel"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <>
                                        <div className="expense-info">
                                            <div className="expense-category">
                                                {category?.icon} {category?.name}
                                                {subcategory && (
                                                    <span className="expense-subcategory">
                                                        {' '}→ {subcategory.icon} {subcategory.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="expense-description">{expense.description}</div>
                                            <div className="expense-date">{new Date(expense.date).toLocaleDateString()}</div>
                                        </div>
                                        <div className="expense-actions">
                                            <div className="expense-amount">{formatCurrency(expense.amount, data.currency)}</div>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEdit(expense)}
                                                title="Edit expense"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDelete(expense.id)}
                                                title="Delete expense"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ExpenseForm;
