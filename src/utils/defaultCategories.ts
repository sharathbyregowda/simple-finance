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

    // Wants (30%)
    { id: 'cat-8', name: 'Dining Out', type: ExpenseCategory.WANTS, icon: '🍽️', color: '#A855F7' },
    { id: 'cat-9', name: 'Entertainment', type: ExpenseCategory.WANTS, icon: '🎬', color: '#A855F7' },
    { id: 'cat-10', name: 'Shopping', type: ExpenseCategory.WANTS, icon: '🛍️', color: '#A855F7' },
    { id: 'cat-11', name: 'Subscriptions', type: ExpenseCategory.WANTS, icon: '📺', color: '#A855F7' },
    { id: 'cat-12', name: 'Hobbies', type: ExpenseCategory.WANTS, icon: '🎨', color: '#A855F7' },
    { id: 'cat-13', name: 'Travel', type: ExpenseCategory.WANTS, icon: '✈️', color: '#A855F7' },

    // Savings (20%)
    { id: 'cat-14', name: 'Emergency Fund', type: ExpenseCategory.SAVINGS, icon: '🏦', color: '#10B981' },
    { id: 'cat-15', name: 'Investments', type: ExpenseCategory.SAVINGS, icon: '📈', color: '#10B981' },
    { id: 'cat-16', name: 'Retirement', type: ExpenseCategory.SAVINGS, icon: '🏖️', color: '#10B981' },
    { id: 'cat-17', name: 'Savings Account', type: ExpenseCategory.SAVINGS, icon: '💰', color: '#10B981' },
];
