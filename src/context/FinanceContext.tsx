
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
    FinancialData,
    Income,
    Expense,
    CustomCategory,
    BudgetSummary,
    MonthlyData,
    CategoryHierarchy,
    RecurringTransaction,
} from '../types';
import { saveFinancialData, loadFinancialData } from '../utils/localStorage';
import { migrateData, CURRENT_DATA_VERSION } from '../utils/migrations';
import { calculateBudgetSummary, calculateMonthlyTrends, getCurrentMonth } from '../utils/calculations';
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories';

interface FinanceContextType {
    data: FinancialData;
    budgetSummary: BudgetSummary;
    monthlyTrends: MonthlyData[];

    // Income methods
    addIncome: (income: Omit<Income, 'id' | 'month'>) => void;
    updateIncome: (id: string, income: Partial<Income>) => void;
    deleteIncome: (id: string) => void;

    // Expense methods
    addExpense: (expense: Omit<Expense, 'id' | 'month' | 'categoryType'>) => void;
    updateExpense: (id: string, expense: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;

    // Category management
    addCategory: (category: Omit<CustomCategory, 'id'>) => void;
    addSubcategory: (parentId: string, subcategory: Omit<CustomCategory, 'id' | 'parentId' | 'isSubcategory'>) => void;
    updateCategory: (id: string, updates: Partial<CustomCategory>) => void;
    deleteCategory: (id: string) => void;
    getSubcategories: (parentId: string) => CustomCategory[];
    getCategoryHierarchy: () => CategoryHierarchy[];

    // Utility methods
    setCurrentMonth: (month: string) => void;
    setCurrency: (currency: string) => void;
    completeOnboarding: () => void;
    clearAllData: () => void;
    importData: (data: FinancialData) => void;

    // Recurring transaction methods
    addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
    updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
    deleteRecurringTransaction: (id: string) => void;
    applyRecurringTransactions: (month: string) => { applied: number; skipped: number };
    getPendingRecurringTransactions: (month: string) => RecurringTransaction[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};

interface FinanceProviderProps {
    children: ReactNode;
}


export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
    const [data, setData] = useState<FinancialData>(() => {
        const savedData = loadFinancialData();

        if (savedData) {
            // If data exists but isOnboarded is undefined, assume true for existing users
            // unless it's a completely empty state which shouldn't happen with savedData
            const migrated = migrateData(savedData);
            return {
                ...migrated,
                isOnboarded: migrated.isOnboarded ?? true
            };
        }

        // Initial empty state
        return {
            incomes: [],
            expenses: [],
            customCategories: DEFAULT_CATEGORIES,
            currentMonth: getCurrentMonth(),
            currency: 'USD',
            isOnboarded: false, // New users start as not onboarded
            version: CURRENT_DATA_VERSION,
            recurringTransactions: [],
        };
    });

    const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>(() =>
        calculateBudgetSummary(data.incomes, data.expenses, data.currentMonth)
    );

    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyData[]>(() =>
        calculateMonthlyTrends(data.incomes, data.expenses)
    );

    // Save to localStorage whenever data changes
    useEffect(() => {
        saveFinancialData(data);
        setBudgetSummary(calculateBudgetSummary(data.incomes, data.expenses, data.currentMonth));
        setMonthlyTrends(calculateMonthlyTrends(data.incomes, data.expenses));
    }, [data]);

    // Income methods
    const addIncome = (income: Omit<Income, 'id' | 'month'>) => {
        const newIncome: Income = {
            ...income,
            id: `income-${Date.now()}-${Math.random()}`,
            month: income.date.substring(0, 7), // Extract YYYY-MM from date
        };
        setData((prev) => ({ ...prev, incomes: [...prev.incomes, newIncome] }));
    };

    const updateIncome = (id: string, updates: Partial<Income>) => {
        setData((prev) => ({
            ...prev,
            incomes: prev.incomes.map((income) =>
                income.id === id
                    ? { ...income, ...updates, month: updates.date?.substring(0, 7) || income.month }
                    : income
            ),
        }));
    };

    const deleteIncome = (id: string) => {
        setData((prev) => ({
            ...prev,
            incomes: prev.incomes.filter((income) => income.id !== id),
        }));
    };

    // Expense methods
    const addExpense = (expense: Omit<Expense, 'id' | 'month' | 'categoryType'>) => {
        const category = data.customCategories.find((cat) => cat.id === expense.categoryId);
        if (!category) {
            console.error('Category not found');
            return;
        }

        const newExpense: Expense = {
            ...expense,
            id: `expense-${Date.now()}-${Math.random()}`,
            month: expense.date.substring(0, 7),
            categoryType: category.type,
        };
        setData((prev) => ({ ...prev, expenses: [...prev.expenses, newExpense] }));
    };

    const updateExpense = (id: string, updates: Partial<Expense>) => {
        setData((prev) => ({
            ...prev,
            expenses: prev.expenses.map((expense) => {
                if (expense.id !== id) return expense;

                const updatedExpense = { ...expense, ...updates };

                // Update categoryType if categoryId changed
                if (updates.categoryId) {
                    const category = prev.customCategories.find((cat) => cat.id === updates.categoryId);
                    if (category) {
                        updatedExpense.categoryType = category.type;
                    }
                }

                // Update month if date changed
                if (updates.date) {
                    updatedExpense.month = updates.date.substring(0, 7);
                }

                return updatedExpense;
            }),
        }));
    };

    const deleteExpense = (id: string) => {
        setData((prev) => ({
            ...prev,
            expenses: prev.expenses.filter((expense) => expense.id !== id),
        }));
    };

    // Category methods
    const addCategory = (category: Omit<CustomCategory, 'id'>) => {
        const newCategory: CustomCategory = {
            ...category,
            id: Date.now().toString(),
        };
        setData((prev) => ({
            ...prev,
            customCategories: [...prev.customCategories, newCategory],
        }));
    };

    const addSubcategory = (
        parentId: string,
        subcategory: Omit<CustomCategory, 'id' | 'parentId' | 'isSubcategory'>
    ) => {
        const parent = data.customCategories.find((cat) => cat.id === parentId);
        if (!parent) return;

        const newSubcategory: CustomCategory = {
            ...subcategory,
            id: Date.now().toString(),
            parentId,
            isSubcategory: true,
            type: parent.type, // Inherit parent's type
        };
        setData((prev) => ({
            ...prev,
            customCategories: [...prev.customCategories, newSubcategory],
        }));
    };

    const updateCategory = (id: string, updates: Partial<CustomCategory>) => {
        setData((prev) => {
            const updatedCategories = prev.customCategories.map((cat) =>
                cat.id === id ? { ...cat, ...updates } : cat
            );

            // If category type changed, update all expenses using this category
            const category = prev.customCategories.find((cat) => cat.id === id);
            const updatedCategory = updatedCategories.find((cat) => cat.id === id);

            let updatedExpenses = prev.expenses;
            if (category && updatedCategory && category.type !== updatedCategory.type) {
                updatedExpenses = prev.expenses.map((expense) =>
                    expense.categoryId === id
                        ? { ...expense, categoryType: updatedCategory.type }
                        : expense
                );
            }

            return {
                ...prev,
                customCategories: updatedCategories,
                expenses: updatedExpenses,
            };
        });
    };

    const deleteCategory = (id: string) => {
        // Also delete all subcategories and expenses associated with this category
        setData((prev) => {
            const subcategoryIds = prev.customCategories
                .filter((cat) => cat.parentId === id)
                .map((cat) => cat.id);

            return {
                ...prev,
                customCategories: prev.customCategories.filter(
                    (cat) => cat.id !== id && cat.parentId !== id
                ),
                expenses: prev.expenses.filter(
                    (exp) => exp.categoryId !== id && !subcategoryIds.includes(exp.subcategoryId || '')
                ),
            };
        });
    };

    const getSubcategories = (parentId: string): CustomCategory[] => {
        return data.customCategories.filter((cat) => cat.parentId === parentId);
    };

    const getCategoryHierarchy = (): CategoryHierarchy[] => {
        const parentCategories = data.customCategories.filter((cat) => !cat.isSubcategory);
        return parentCategories.map((parent) => ({
            category: parent,
            subcategories: getSubcategories(parent.id),
        }));
    };

    // Utility methods
    const setCurrentMonth = (month: string) => {
        setData((prev) => ({ ...prev, currentMonth: month }));
    };

    const setCurrency = (currency: string) => {
        setData((prev) => ({ ...prev, currency }));
    };

    const completeOnboarding = () => {
        setData((prev) => ({ ...prev, isOnboarded: true }));
    };

    const clearAllData = () => {
        setData({
            incomes: [],
            expenses: [],
            customCategories: DEFAULT_CATEGORIES,
            currentMonth: getCurrentMonth(),
            currency: 'USD',
            recurringTransactions: [],
        });
    };

    const importData = (newData: FinancialData) => {
        // Basic validation
        if (!newData.incomes || !newData.expenses || !newData.customCategories) {
            alert('Invalid data file. Missing required fields.');
            return;
        }

        // Merge with defaults to ensure backward compatibility with old backups
        // that might be missing new fields like isOnboarded
        const mergedData: FinancialData = {
            incomes: newData.incomes,
            expenses: newData.expenses,
            customCategories: newData.customCategories,
            currentMonth: newData.currentMonth || getCurrentMonth(),
            currency: newData.currency || 'USD',
            // If isOnboarded is not in the backup, default to true 
            // (since they have data, they must have been onboarded)
            isOnboarded: newData.isOnboarded !== undefined ? newData.isOnboarded : true,
            recurringTransactions: newData.recurringTransactions || [],
        };

        setData(mergedData);
    };

    // Recurring Transaction Methods
    const addRecurringTransaction = (transaction: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
        const newTransaction: RecurringTransaction = {
            ...transaction,
            id: `recurring-${Date.now()}-${Math.random()}`,
            createdAt: new Date().toISOString(),
        };
        setData((prev) => ({
            ...prev,
            recurringTransactions: [...(prev.recurringTransactions || []), newTransaction],
        }));
    };

    const updateRecurringTransaction = (id: string, updates: Partial<RecurringTransaction>) => {
        setData((prev) => ({
            ...prev,
            recurringTransactions: (prev.recurringTransactions || []).map((rt) =>
                rt.id === id ? { ...rt, ...updates } : rt
            ),
        }));
    };

    const deleteRecurringTransaction = (id: string) => {
        setData((prev) => ({
            ...prev,
            recurringTransactions: (prev.recurringTransactions || []).filter((rt) => rt.id !== id),
        }));
    };

    const getPendingRecurringTransactions = (month: string): RecurringTransaction[] => {
        return (data.recurringTransactions || []).filter((rt) => {
            // Only active transactions
            if (!rt.isActive) return false;
            // Not already applied for this month
            if (rt.lastAppliedMonth === month) return false;
            return true;
        });
    };

    const applyRecurringTransactions = (month: string): { applied: number; skipped: number } => {
        const pending = getPendingRecurringTransactions(month);
        let applied = 0;
        let skipped = 0;

        pending.forEach((rt) => {
            // Calculate the actual date for this transaction
            const [year, monthNum] = month.split('-');
            const daysInMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
            const dayOfMonth = Math.min(rt.dayOfMonth, daysInMonth);
            const transactionDate = `${month}-${String(dayOfMonth).padStart(2, '0')}`;

            if (rt.type === 'income' && rt.source) {
                addIncome({
                    amount: rt.amount,
                    source: rt.source,
                    date: transactionDate,
                });
                applied++;
            } else if (rt.type === 'expense' && rt.categoryId) {
                const category = data.customCategories.find((c) => c.id === rt.categoryId);
                if (category) {
                    addExpense({
                        amount: rt.amount,
                        description: rt.description || '',
                        categoryId: rt.categoryId,
                        subcategoryId: rt.subcategoryId,
                        date: transactionDate,
                    });
                    applied++;
                } else {
                    skipped++;
                }
            } else {
                skipped++;
            }

            // Mark as applied for this month
            updateRecurringTransaction(rt.id, { lastAppliedMonth: month });
        });

        return { applied, skipped };
    };

    const value: FinanceContextType = {
        data,
        budgetSummary,
        monthlyTrends,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addCategory,
        addSubcategory,
        updateCategory,
        deleteCategory,
        getSubcategories,
        getCategoryHierarchy,
        setCurrentMonth,
        setCurrency,
        completeOnboarding,
        clearAllData,
        importData,
        // Recurring transaction methods
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        applyRecurringTransactions,
        getPendingRecurringTransactions,
    };

    return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
