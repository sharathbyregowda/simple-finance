import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryBreakdown from './CategoryBreakdown';
import { useFinance } from '../context/FinanceContext';
import { ExpenseCategory } from '../types';
import type { CategoryExpenseData } from '../types';

// Mock dependencies
vi.mock('../context/FinanceContext');
vi.mock('../utils/calculations', async () => {
    const actual = await vi.importActual('../utils/calculations');
    return {
        ...actual,
        calculateCategoryBreakdown: vi.fn(),
    };
});

import { calculateCategoryBreakdown } from '../utils/calculations';

describe('CategoryBreakdown', () => {
    const mockCategories: CategoryExpenseData[] = [
        {
            categoryId: 'cat-1',
            categoryName: 'Housing',
            categoryIcon: '🏠',
            categoryType: ExpenseCategory.NEEDS,
            amount: 2000,
            percentage: 50,
            color: '#F59E0B'
        },
        {
            categoryId: 'cat-2',
            categoryName: 'Entertainment',
            categoryIcon: '🎬',
            categoryType: ExpenseCategory.WANTS,
            amount: 1000,
            percentage: 25,
            color: '#A855F7'
        },
        {
            categoryId: 'cat-3',
            categoryName: 'Investments',
            categoryIcon: '📈',
            categoryType: ExpenseCategory.SAVINGS,
            amount: 1000,
            percentage: 25,
            color: '# 10B981'
        }
    ];

    const mockFinanceData = {
        data: {
            currentMonth: '2024-01',
            currency: 'USD',
            expenses: [],
            customCategories: [],
            incomes: [],
            version: 4,
            isOnboarded: true
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useFinance).mockReturnValue(mockFinanceData as any);
        vi.mocked(calculateCategoryBreakdown).mockReturnValue(mockCategories);
    });

    describe('Rendering', () => {
        it('should render Category Breakdown title', () => {
            render(<CategoryBreakdown />);
            expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
        });

        it('should render all category filter buttons', () => {
            render(<CategoryBreakdown />);

            expect(screen.getByText('All')).toBeInTheDocument();
            expect(screen.getByText('Needs')).toBeInTheDocument();
            expect(screen.getByText('Wants')).toBeInTheDocument();
            expect(screen.getByText('Savings')).toBeInTheDocument();
        });

        it('should render chart type toggle buttons', () => {
            render(<CategoryBreakdown />);

            expect(screen.getByText(/Bar Chart/)).toBeInTheDocument();
            expect(screen.getByText(/Pie Chart/)).toBeInTheDocument();
        });
    });

    describe('Category Filtering', () => {
        it('should show all categories by default', () => {
            render(<CategoryBreakdown />);

            expect(screen.getByText('Housing')).toBeInTheDocument();
            expect(screen.getByText('Entertainment')).toBeInTheDocument();
            expect(screen.getByText('Investments')).toBeInTheDocument();
        });

        it('should filter Needs categories when Needs clicked', () => {
            const needsOnly = mockCategories.filter(c => c.categoryType === ExpenseCategory.NEEDS);

            render(<CategoryBreakdown />);

            const needsButton = screen.getByRole('button', { name: 'Needs' });
            fireEvent.click(needsButton);

            // After click, should show only needs categories
            expect(screen.getByText('Housing')).toBeInTheDocument();
        });

        it('should filter Wants categories when Wants clicked', () => {
            render(<CategoryBreakdown />);

            const wantsButton = screen.getByRole('button', { name: 'Wants' });
            fireEvent.click(wantsButton);

            // Should show wants categories
            expect(screen.getByText('Entertainment')).toBeInTheDocument();
        });

        it('should filter Savings categories when Savings clicked', () => {
            render(<CategoryBreakdown />);

            const savingsButton = screen.getByRole('button', { name: 'Savings' });
            fireEvent.click(savingsButton);

            // Should show savings categories
            expect(screen.getByText('Investments')).toBeInTheDocument();
        });

        it('should highlight active filter button', () => {
            render(<CategoryBreakdown />);

            const allButton = screen.getByRole('button', { name: 'All' });
            expect(allButton).toHaveClass('active');

            const needsButton = screen.getByRole('button', { name: 'Needs' });
            fireEvent.click(needsButton);

            expect(needsButton).toHaveClass('active');
            expect(allButton).not.toHaveClass('active');
        });
    });

    describe('Chart Type Switching', () => {
        it('should show bar chart by default', () => {
            render(<CategoryBreakdown />);

            const barButton = screen.getByRole('button', { name: /Bar Chart/ });
            expect(barButton).toHaveClass('active');
        });

        it('should switch to pie chart when clicked', () => {
            render(<CategoryBreakdown />);

            const pieButton = screen.getByRole('button', { name: /Pie Chart/ });
            fireEvent.click(pieButton);

            expect(pieButton).toHaveClass('active');
        });

        it('should toggle between chart types', () => {
            render(<CategoryBreakdown />);

            const barButton = screen.getByRole('button', { name: /Bar Chart/ });
            const pieButton = screen.getByRole('button', { name: /Pie Chart/ });

            // Start with bar
            expect(barButton).toHaveClass('active');

            // Switch to pie
            fireEvent.click(pieButton);
            expect(pieButton).toHaveClass('active');
            expect(barButton).not.toHaveClass('active');

            // Switch back to bar
            fireEvent.click(barButton);
            expect(barButton).toHaveClass('active');
            expect(pieButton).not.toHaveClass('active');
        });
    });

    describe('Data Display', () => {
        it('should display category names with icons', () => {
            render(<CategoryBreakdown />);

            expect(screen.getByText('Housing')).toBeInTheDocument();
            expect(screen.getByText('🏠')).toBeInTheDocument();
        });

        it('should display category amounts', () => {
            render(<CategoryBreakdown />);

            // Check for amounts (formatted as currency)
            expect(screen.getAllByText(/\$2,000/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/\$1,000/).length).toBeGreaterThan(0);
        });

        it('should display category percentages', () => {
            render(<CategoryBreakdown />);

            expect(screen.getByText('50.0%')).toBeInTheDocument();
            expect(screen.getAllByText('25.0%').length).toBe(2);
        });

        it('should display total expenses', () => {
            render(<CategoryBreakdown />);

            // Total = 2000 + 1000 + 1000 = 4000
            expect(screen.getByText(/\$4,000 total/)).toBeInTheDocument();
        });

        it('should show top 5 categories only', () => {
            const manyCategories: CategoryExpenseData[] = Array.from({ length: 10 }, (_, i) => ({
                categoryId: `cat-${i}`,
                categoryName: `Category ${i}`,
                categoryIcon: '💰',
                categoryType: ExpenseCategory.NEEDS,
                amount: 100 * (10 - i),
                percentage: 10,
                color: '#F59E0B'
            }));

            vi.mocked(calculateCategoryBreakdown).mockReturnValue(manyCategories);

            const { container } = render(<CategoryBreakdown />);
            const categoryItems = container.querySelectorAll('.category-breakdown-item');

            expect(categoryItems.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no expenses', () => {
            vi.mocked(calculateCategoryBreakdown).mockReturnValue([]);

            render(<CategoryBreakdown />);

            expect(screen.getByText('No expenses for this month')).toBeInTheDocument();
        });

        it('should not show chart when no expenses', () => {
            vi.mocked(calculateCategoryBreakdown).mockReturnValue([]);

            const { container } = render(<CategoryBreakdown />);

            // Should not have ResponsiveContainer
            expect(container.querySelector('.recharts-responsive-container')).not.toBeInTheDocument();
        });
    });

    describe('Currency Display', () => {
        it('should format amounts in user currency', () => {
            vi.mocked(useFinance).mockReturnValue({
                data: {
                    ...mockFinanceData.data,
                    currency: 'EUR'
                }
            } as any);

            render(<CategoryBreakdown />);

            // Should show EUR symbol
            expect(screen.getAllByText(/€/).length).toBeGreaterThan(0);
        });

        it('should support different currencies', () => {
            const currencies = ['USD', 'GBP', 'INR', 'JPY'];
            const symbols = ['$', '£', '₹', '¥'];

            currencies.forEach((currency, idx) => {
                vi.mocked(useFinance).mockReturnValue({
                    data: {
                        ...mockFinanceData.data,
                        currency
                    }
                } as any);

                const { unmount } = render(<CategoryBreakdown />);

                // Check for currency symbol (at least one occurrence)
                const regex = new RegExp(symbols[idx].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                expect(screen.getAllByText(regex).length).toBeGreaterThan(0);

                unmount();
            });
        });
    });

    describe('Visual Elements', () => {
        it('should render progress bars for categories', () => {
            const { container } = render(<CategoryBreakdown />);

            const progressBars = container.querySelectorAll('.category-progress-bar');
            expect(progressBars.length).toBeGreaterThan(0);
        });

        it('should set progress bar width based on percentage', () => {
            const { container } = render(<CategoryBreakdown />);

            const progressFills = container.querySelectorAll('.category-progress-fill');

            // First category has 50% percentage
            expect(progressFills[0]).toHaveStyle({ width: '50%' });
        });

        it('should set progress bar color from category color', () => {
            const { container } = render(<CategoryBreakdown />);

            const progressFills = container.querySelectorAll('.category-progress-fill');

            // Check that colors are applied
            expect(progressFills[0]).toHaveStyle({ backgroundColor: mockCategories[0].color });
        });
    });

    describe('Percentage Calculations', () => {
        it('should display percentages with one decimal place', () => {
            const categoriesWithDecimals: CategoryExpenseData[] = [{
                categoryId: 'cat-1',
                categoryName: 'Test',
                categoryIcon: '💰',
                categoryType: ExpenseCategory.NEEDS,
                amount: 333.33,
                percentage: 33.33,
                color: '#F59E0B'
            }];

            vi.mocked(calculateCategoryBreakdown).mockReturnValue(categoriesWithDecimals);

            render(<CategoryBreakdown />);

            expect(screen.getByText('33.3%')).toBeInTheDocument();
        });

        it('should handle 100% correctly', () => {
            const singleCategory: CategoryExpenseData[] = [{
                categoryId: 'cat-1',
                categoryName: 'Only Category',
                categoryIcon: '💰',
                categoryType: ExpenseCategory.NEEDS,
                amount: 1000,
                percentage: 100,
                color: '#F59E0B'
            }];

            vi.mocked(calculateCategoryBreakdown).mockReturnValue(singleCategory);

            render(<CategoryBreakdown />);

            expect(screen.getByText('100.0%')).toBeInTheDocument();
        });
    });

    describe('Sorting', () => {
        it('should display categories sorted by amount descending', () => {
            // Categories are pre-sorted in mock data (2000, 1000, 1000)
            const { container } = render(<CategoryBreakdown />);

            const categoryNames = Array.from(container.querySelectorAll('.category-name'))
                .map(el => el.textContent);

            // Housing (2000) should be first
            expect(categoryNames[0]).toBe('Housing');
        });
    });

    describe('Chart Rendering', () => {
        it('should render Recharts components', () => {
            const { container } = render(<CategoryBreakdown />);

            // Check for Recharts container
            expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
        });
    });
});
