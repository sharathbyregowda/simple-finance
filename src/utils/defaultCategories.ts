import type { CustomCategory } from '../types';
import { ExpenseCategory } from '../types';

export const DEFAULT_CATEGORIES: CustomCategory[] = [
    // Needs (50%)
    { id: 'cat-1', name: 'Housing/Rent', type: ExpenseCategory.NEEDS, icon: '🏠', color: '#F59E0B' },
    { id: 'cat-2', name: 'Utilities', type: ExpenseCategory.NEEDS, icon: '💡', color: '#F59E0B' },
    { id: 'cat-3', name: 'Groceries', type: ExpenseCategory.NEEDS, icon: '🛒', color: '#F59E0B' },
    { id: 'cat-4', name: 'Transportation', type: ExpenseCategory.NEEDS, icon: '🚗', color: '#F59E0B' },
    { id: 'cat-5', name: 'Insurance', type: ExpenseCategory.NEEDS, icon: '🛡️', color: '#F59E0B' },
    { id: 'cat-6', name: 'Healthcare', type: ExpenseCategory.NEEDS, icon: '⚕️', color: '#F59E0B' },
    { id: 'cat-7', name: 'Debt Payments', type: ExpenseCategory.NEEDS, icon: '💳', color: '#F59E0B' },
    { id: 'cat-18', name: 'Pets', type: ExpenseCategory.NEEDS, icon: '🐾', color: '#F59E0B' },

    // Wants (30%)
    { id: 'cat-8', name: 'Eating Out / Takeaway', type: ExpenseCategory.WANTS, icon: '🥡', color: '#A855F7' },
    { id: 'cat-9', name: 'Entertainment', type: ExpenseCategory.WANTS, icon: '🎬', color: '#A855F7' },
    { id: 'cat-10', name: 'Shopping', type: ExpenseCategory.WANTS, icon: '🛍️', color: '#A855F7' },
    { id: 'cat-11', name: 'Subscriptions', type: ExpenseCategory.WANTS, icon: '📺', color: '#A855F7' },
    { id: 'cat-12', name: 'Hobbies', type: ExpenseCategory.WANTS, icon: '🎨', color: '#A855F7' },
    { id: 'cat-13', name: 'Holiday', type: ExpenseCategory.WANTS, icon: '✈️', color: '#A855F7' },

    // Savings (20%)
    { id: 'cat-14', name: 'Emergency Fund', type: ExpenseCategory.SAVINGS, icon: '🏦', color: '#10B981' },
    { id: 'cat-15', name: 'Investments', type: ExpenseCategory.SAVINGS, icon: '📈', color: '#10B981' },
    { id: 'cat-16', name: 'Pension', type: ExpenseCategory.SAVINGS, icon: '👴', color: '#10B981' },
    { id: 'cat-17', name: 'Savings Account', type: ExpenseCategory.SAVINGS, icon: '💰', color: '#10B981' },

    // Income
    { id: 'cat-income-1', name: 'Husband Salary', type: ExpenseCategory.INCOME, icon: '👨‍💼', color: '#10B981' },
    { id: 'cat-income-2', name: 'Wife Salary', type: ExpenseCategory.INCOME, icon: '👩‍💼', color: '#10B981' },
    { id: 'cat-income-3', name: 'Dividends', type: ExpenseCategory.INCOME, icon: '📈', color: '#10B981' },
    { id: 'cat-income-4', name: 'Bank Interest', type: ExpenseCategory.INCOME, icon: '🏦', color: '#10B981' },

    // Default Subcategories (UK Context)
    // Utilities
    { id: 'sub-util-1', name: 'Council Tax', type: ExpenseCategory.NEEDS, icon: '🏛️', parentId: 'cat-2', isSubcategory: true },
    { id: 'sub-util-2', name: 'Water Bill', type: ExpenseCategory.NEEDS, icon: '💧', parentId: 'cat-2', isSubcategory: true },
    { id: 'sub-util-3', name: 'Electricity & Gas', type: ExpenseCategory.NEEDS, icon: '⚡', parentId: 'cat-2', isSubcategory: true },
    { id: 'sub-util-4', name: 'Broadband', type: ExpenseCategory.NEEDS, icon: '🌐', parentId: 'cat-2', isSubcategory: true },
    { id: 'sub-util-5', name: 'Mobile Phone', type: ExpenseCategory.NEEDS, icon: '📱', parentId: 'cat-2', isSubcategory: true },
    { id: 'sub-util-6', name: 'TV Licence', type: ExpenseCategory.NEEDS, icon: '📺', parentId: 'cat-2', isSubcategory: true },

    // Groceries
    { id: 'sub-groc-1', name: 'High Street Supermarkets', type: ExpenseCategory.NEEDS, icon: '🛒', parentId: 'cat-3', isSubcategory: true },
    { id: 'sub-groc-2', name: 'Costco', type: ExpenseCategory.NEEDS, icon: '🏬', parentId: 'cat-3', isSubcategory: true },
    { id: 'sub-groc-3', name: 'Market/Bakery', type: ExpenseCategory.NEEDS, icon: '🥖', parentId: 'cat-3', isSubcategory: true },

    // Transportation
    { id: 'sub-trans-1', name: 'Petrol/Diesel', type: ExpenseCategory.NEEDS, icon: '⛽', parentId: 'cat-4', isSubcategory: true },
    { id: 'sub-trans-2', name: 'Public Transport', type: ExpenseCategory.NEEDS, icon: '🚌', parentId: 'cat-4', isSubcategory: true },
    { id: 'sub-trans-3', name: 'Car Insurance', type: ExpenseCategory.NEEDS, icon: '🛡️', parentId: 'cat-4', isSubcategory: true },
    { id: 'sub-trans-4', name: 'Road Tax', type: ExpenseCategory.NEEDS, icon: '🧾', parentId: 'cat-4', isSubcategory: true },
    { id: 'sub-trans-5', name: 'MOT', type: ExpenseCategory.NEEDS, icon: '🔧', parentId: 'cat-4', isSubcategory: true },
    { id: 'sub-trans-6', name: 'Car Service', type: ExpenseCategory.NEEDS, icon: '⚙️', parentId: 'cat-4', isSubcategory: true },

    // Investments
    { id: 'sub-inv-1', name: 'ISA', type: ExpenseCategory.SAVINGS, icon: '💰', parentId: 'cat-15', isSubcategory: true },
    { id: 'sub-inv-2', name: 'Premium Bonds', type: ExpenseCategory.SAVINGS, icon: '🎫', parentId: 'cat-15', isSubcategory: true },
    { id: 'sub-inv-3', name: 'Stocks & Shares', type: ExpenseCategory.SAVINGS, icon: '📊', parentId: 'cat-15', isSubcategory: true },

    // Pets
    { id: 'sub-pets-1', name: 'Food', type: ExpenseCategory.NEEDS, icon: '🦴', parentId: 'cat-18', isSubcategory: true },
    { id: 'sub-pets-2', name: 'Vet/Medical', type: ExpenseCategory.NEEDS, icon: '⚕️', parentId: 'cat-18', isSubcategory: true },
    { id: 'sub-pets-3', name: 'Grooming', type: ExpenseCategory.NEEDS, icon: '✂️', parentId: 'cat-18', isSubcategory: true },
    { id: 'sub-pets-4', name: 'Supplies', type: ExpenseCategory.NEEDS, icon: '💩', parentId: 'cat-18', isSubcategory: true },
    { id: 'sub-pets-5', name: 'Treats', type: ExpenseCategory.NEEDS, icon: '🍪', parentId: 'cat-18', isSubcategory: true },
];
