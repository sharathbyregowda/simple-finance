
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
    FinancialData,
    Income,
    Expense,
    CustomCategory,
    BudgetSummary,
    MonthlyData,
    CategoryHierarchy,
} from '../types';
import { ExpenseCategory } from '../types';
import { saveFinancialData, loadFinancialData } from '../utils/localStorage';
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
    clearAllData: () => void;
    importData: (data: FinancialData) => void;
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

const CURRENT_DATA_VERSION = 3;

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
    const [data, setData] = useState<FinancialData>(() => {
        const savedData = loadFinancialData();

        if (savedData) {
            // Check for migration needs
            let migratedData = { ...savedData };
            let hasChanges = false;

            // Migration 1: Ensure all categories have a type and defaults exist
            if (!migratedData.version || migratedData.version < 1) {
                console.log('Migrating data to version 1...');

                // 1. Ensure all categories have a valid type (fallback to NEEDS)
                migratedData.customCategories = migratedData.customCategories.map(cat => ({
                    ...cat,
                    type: cat.type || ExpenseCategory.NEEDS
                }));

                migratedData.version = 1;
                hasChanges = true;
            }

            // Migration 2: UK Context Updates (Renames)
            if (migratedData.version < 2) {
                console.log('Migrating data to version 2 (UK Context)...');

                // Rename specific categories
                const renames: Record<string, { name: string; icon: string }> = {
                    'cat-8': { name: 'Eating Out / Takeaway', icon: '🥡' }, // Dining Out
                    'cat-13': { name: 'Holiday', icon: '✈️' }, // Travel
                    'cat-16': { name: 'Pension', icon: '👴' }, // Retirement
                };

                migratedData.customCategories = migratedData.customCategories.map(cat => {
                    if (renames[cat.id]) {
                        return { ...cat, ...renames[cat.id] };
                    }
                    return cat;
                });

                migratedData.version = 2;
                hasChanges = true;
            }

            // Migration 3: Add Pets Category
            if (migratedData.version < 3) {
                console.log('Migrating data to version 3 (Pets)...');
                // The "missing defaults" logic below will handle adding the new categories
                // We just need to bump the version here
                migratedData.version = 3;
                hasChanges = true;
            }

            // Always check for missing defaults (for new subcategories)
            const existingIds = new Set(migratedData.customCategories.map((c) => c.id));
            const missingDefaults = DEFAULT_CATEGORIES.filter((dc) => !existingIds.has(dc.id));

            if (missingDefaults.length > 0) {
                console.log('Adding missing default categories:', missingDefaults.length);
                migratedData.customCategories = [...migratedData.customCategories, ...missingDefaults];
                hasChanges = true;
            }

            if (hasChanges) {
                saveFinancialData(migratedData);
                return migratedData;
            }

            return savedData;
        }

        // Initial empty state
        return {
            incomes: [],
            expenses: [],
            customCategories: DEFAULT_CATEGORIES,
            currentMonth: getCurrentMonth(),
            currency: 'USD',
            version: CURRENT_DATA_VERSION,
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

    const clearAllData = () => {
        setData({
            incomes: [],
            expenses: [],
            customCategories: DEFAULT_CATEGORIES,
            currentMonth: getCurrentMonth(),
            currency: 'USD',
        });
    };

    const importData = (newData: FinancialData) => {
        // Basic validation
        if (!newData.incomes || !newData.expenses || !newData.customCategories) {
            alert('Invalid data file. Missing required fields.');
            return;
        }
        setData(newData);
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
        clearAllData,
        importData,
    };

    return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
