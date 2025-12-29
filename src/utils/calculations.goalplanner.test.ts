import { describe, it, expect } from 'vitest';
import {
    calculateAverageMonthlyCashBalance,
    calculateGoalTimeline
} from './calculations';
import type { Income, Expense } from '../types';
import { ExpenseCategory } from '../types';

describe('Goal Planner Calculations', () => {
    describe('calculateAverageMonthlyCashBalance', () => {
        it('should return 0 when there are no months', () => {
            const result = calculateAverageMonthlyCashBalance([], []);
            expect(result).toBe(0);
        });

        it('should calculate average cash balance from monthly data', () => {
            const incomes: Income[] = [
                { id: '1', amount: 5000, source: 'Salary', date: '2025-01-15', month: '2025-01' },
                { id: '2', amount: 5000, source: 'Salary', date: '2025-02-15', month: '2025-02' },
                { id: '3', amount: 5000, source: 'Salary', date: '2025-03-15', month: '2025-03' },
            ];

            const expenses: Expense[] = [
                // Month 1: 2000 needs + 500 wants + 500 savings = 3000 total
                { id: '1', amount: 2000, description: 'Rent', categoryId: 'c1', categoryType: ExpenseCategory.NEEDS, date: '2025-01-01', month: '2025-01' },
                { id: '2', amount: 500, description: 'Entertainment', categoryId: 'c2', categoryType: ExpenseCategory.WANTS, date: '2025-01-05', month: '2025-01' },
                { id: '3', amount: 500, description: 'Investment', categoryId: 'c3', categoryType: ExpenseCategory.SAVINGS, date: '2025-01-10', month: '2025-01' },

                // Month 2: 2000 needs + 600 wants + 400 savings = 3000 total
                { id: '4', amount: 2000, description: 'Rent', categoryId: 'c1', categoryType: ExpenseCategory.NEEDS, date: '2025-02-01', month: '2025-02' },
                { id: '5', amount: 600, description: 'Dining', categoryId: 'c2', categoryType: ExpenseCategory.WANTS, date: '2025-02-05', month: '2025-02' },
                { id: '6', amount: 400, description: 'Investment', categoryId: 'c3', categoryType: ExpenseCategory.SAVINGS, date: '2025-02-10', month: '2025-02' },

                // Month 3: 2000 needs + 700 wants + 300 savings = 3000 total
                { id: '7', amount: 2000, description: 'Rent', categoryId: 'c1', categoryType: ExpenseCategory.NEEDS, date: '2025-03-01', month: '2025-03' },
                { id: '8', amount: 700, description: 'Shopping', categoryId: 'c2', categoryType: ExpenseCategory.WANTS, date: '2025-03-05', month: '2025-03' },
                { id: '9', amount: 300, description: 'Investment', categoryId: 'c3', categoryType: ExpenseCategory.SAVINGS, date: '2025-03-10', month: '2025-03' },
            ];

            const result = calculateAverageMonthlyCashBalance(incomes, expenses, false);

            // Month 1: 5000 - 2500 (needs+wants) - 500 (savings) = 2000
            // Month 2: 5000 - 2600 (needs+wants) - 400 (savings) = 2000
            // Month 3: 5000 - 2700 (needs+wants) - 300 (savings) = 2000
            // Average: (2000 + 2000 + 2000) / 3 = 2000
            expect(result).toBe(2000);
        });

        it('should exclude current month by default', () => {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
            const currentMonthStr = `${currentYear}-${currentMonth}`;

            const prevMonth = new Date(currentDate);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

            const incomes: Income[] = [
                { id: '1', amount: 5000, source: 'Salary', date: prevMonthStr + '-15', month: prevMonthStr },
                { id: '2', amount: 5000, source: 'Salary', date: currentMonthStr + '-15', month: currentMonthStr },
            ];

            const expenses: Expense[] = [
                { id: '1', amount: 2000, description: 'Rent', categoryId: 'c1', categoryType: ExpenseCategory.NEEDS, date: prevMonthStr + '-01', month: prevMonthStr },
                { id: '2', amount: 500, description: 'Investment', categoryId: 'c2', categoryType: ExpenseCategory.SAVINGS, date: prevMonthStr + '-10', month: prevMonthStr },
                { id: '3', amount: 2000, description: 'Rent', categoryId: 'c1', categoryType: ExpenseCategory.NEEDS, date: currentMonthStr + '-01', month: currentMonthStr },
            ];

            const result = calculateAverageMonthlyCashBalance(incomes, expenses, true);

            // Should only calculate for prev month
            // Prev month: 5000 - 2000 - 500 = 2500
            expect(result).toBe(2500);
        });

        it('should handle negative cash balance (overspending)', () => {
            const incomes: Income[] = [
                { id: '1', amount: 3000, source: 'Salary', date: '2025-01-15', month: '2025-01' },
            ];

            const expenses: Expense[] = [
                { id: '1', amount: 2500, description: 'Rent', categoryId: 'c1', categoryType: ExpenseCategory.NEEDS, date: '2025-01-01', month: '2025-01' },
                { id: '2', amount: 1000, description: 'Shopping', categoryId: 'c2', categoryType: ExpenseCategory.WANTS, date: '2025-01-05', month: '2025-01' },
                { id: '3', amount: 500, description: 'Investment', categoryId: 'c3', categoryType: ExpenseCategory.SAVINGS, date: '2025-01-10', month: '2025-01' },
            ];

            const result = calculateAverageMonthlyCashBalance(incomes, expenses, false);

            // 3000 - 3500 (needs+wants) - 500 (savings) = -1000
            expect(result).toBe(-1000);
        });
    });

    describe('calculateGoalTimeline', () => {
        it('should return success when starting balance >= goal', () => {
            const result = calculateGoalTimeline(5000, 6000, 500);

            expect(result.months).toBe(0);
            expect(result.isAchievable).toBe(true);
            expect(result.message).toContain("You've already reached this goal");
        });

        it('should return not achievable when average cash balance is negative', () => {
            const result = calculateGoalTimeline(10000, 0, -200);

            expect(result.months).toBe(-1);
            expect(result.isAchievable).toBe(false);
            expect(result.message).toContain("not currently building cash balance");
        });

        it('should return not achievable when average cash balance is zero', () => {
            const result = calculateGoalTimeline(10000, 0, 0);

            expect(result.months).toBe(-1);
            expect(result.isAchievable).toBe(false);
            expect(result.message).toContain("not currently building cash balance");
        });

        it('should calculate correct timeline for achievable goal', () => {
            const result = calculateGoalTimeline(10000, 2000, 500);

            // Remaining: 10000 - 2000 = 8000
            // Months: ceil(8000 / 500) = 16
            expect(result.months).toBe(16);
            expect(result.isAchievable).toBe(true);
            expect(result.message).toContain("16 months");
            expect(result.completionDate).toBeDefined();
        });

        it('should handle exact division without rounding up', () => {
            const result = calculateGoalTimeline(10000, 0, 1000);

            // Remaining: 10000
            // Months: ceil(10000 / 1000) = 10
            expect(result.months).toBe(10);
            expect(result.isAchievable).toBe(true);
            expect(result.message).toContain("10 months");
        });

        it('should round up partial months', () => {
            const result = calculateGoalTimeline(10000, 0, 750);

            // Remaining: 10000
            // Months: ceil(10000 / 750) = ceil(13.33) = 14
            expect(result.months).toBe(14);
            expect(result.isAchievable).toBe(true);
            expect(result.message).toContain("14 months");
        });

        it('should use singular "month" when months = 1', () => {
            const result = calculateGoalTimeline(1500, 1000, 500);

            // Remaining: 500
            // Months: ceil(500 / 500) = 1
            expect(result.months).toBe(1);
            expect(result.message).toContain("1 month");
            expect(result.message).not.toContain("1 months");
        });

        it('should calculate completion date correctly', () => {
            const result = calculateGoalTimeline(10000, 0, 1000);

            expect(result.completionDate).toBeDefined();

            const expectedDate = new Date();
            expectedDate.setMonth(expectedDate.getMonth() + 10);

            // Check year and month match (ignore day/time)
            expect(result.completionDate!.getFullYear()).toBe(expectedDate.getFullYear());
            expect(result.completionDate!.getMonth()).toBe(expectedDate.getMonth());
        });

        it('should handle very small cash balance growth', () => {
            const result = calculateGoalTimeline(10000, 0, 10);

            // Remaining: 10000
            // Months: ceil(10000 / 10) = 1000
            expect(result.months).toBe(1000);
            expect(result.isAchievable).toBe(true);
            expect(result.message).toContain("1000 months");
        });
    });
});
