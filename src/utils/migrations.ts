import { ExpenseCategory, type FinancialData } from '../types';
import { DEFAULT_CATEGORIES } from './defaultCategories';
import { saveFinancialData } from './localStorage';

export const CURRENT_DATA_VERSION = 5;

export const migrateData = (savedData: FinancialData): FinancialData => {
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
        migratedData.version = 3;
        hasChanges = true;
    }

    // Migration 4: OOTB Expansion (Holiday, Subscriptions, Eating Out, Housing)
    if (migratedData.version < 4) {
        console.log('Migrating data to version 4 (OOTB Expansion)...');
        // The "missing defaults" logic below will handle adding the new categories
        migratedData.version = 4;
        hasChanges = true;
    }

    // Migration 5: Add Recurring Transactions support
    if (migratedData.version < 5) {
        console.log('Migrating data to version 5 (Recurring Transactions)...');
        if (!migratedData.recurringTransactions) {
            migratedData.recurringTransactions = [];
        }
        migratedData.version = 5;
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
    }

    return migratedData;
};
