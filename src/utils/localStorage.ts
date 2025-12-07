import type { FinancialData } from '../types';

const STORAGE_KEY = 'simple-finance-data';

export const saveFinancialData = (data: FinancialData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save financial data:', error);
    }
};

export const loadFinancialData = (): FinancialData | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to load financial data:', error);
        return null;
    }
};

export const clearFinancialData = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear financial data:', error);
    }
};
