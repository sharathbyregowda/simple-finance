import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { calculateCategoryBreakdown, formatCurrency } from '../utils/calculations';
import { ExpenseCategory } from '../types';
import './Dashboard.css';

type ChartType = 'bar' | 'pie';
type CategoryFilter = 'all' | ExpenseCategory;

const CategoryBreakdown: React.FC = () => {
    const { data } = useFinance();
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

    // Calculate category breakdown
    const allCategoryData = calculateCategoryBreakdown(
        data.expenses,
        data.customCategories,
        data.currentMonth
    );

    // Apply category type filter
    const categoryData =
        categoryFilter === 'all'
            ? allCategoryData
            : allCategoryData.filter((cat) => cat.categoryType === categoryFilter);

    const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

    return (
        <div className="card category-breakdown-card">
            <div className="category-breakdown-header">
                <h3>Category Breakdown</h3>
            </div>

            {/* Category Type Filters */}
            <div className="category-filters">
                <button
                    className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${categoryFilter === ExpenseCategory.NEEDS ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(ExpenseCategory.NEEDS)}
                >
                    Needs
                </button>
                <button
                    className={`filter-btn ${categoryFilter === ExpenseCategory.WANTS ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(ExpenseCategory.WANTS)}
                >
                    Wants
                </button>
                <button
                    className={`filter-btn ${categoryFilter === ExpenseCategory.SAVINGS ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(ExpenseCategory.SAVINGS)}
                >
                    Savings
                </button>
            </div>

            {/* Chart Type Tabs */}
            <div className="chart-tabs">
                <button
                    className={`tab-btn ${chartType === 'bar' ? 'active' : ''}`}
                    onClick={() => setChartType('bar')}
                >
                    📊 Bar Chart
                </button>
                <button
                    className={`tab-btn ${chartType === 'pie' ? 'active' : ''}`}
                    onClick={() => setChartType('pie')}
                >
                    🥧 Pie Chart
                </button>
            </div>

            {/* Chart Display */}
            {categoryData.length === 0 ? (
                <div className="empty-state">
                    <p className="text-muted">No expenses for this month</p>
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={350}>
                        {chartType === 'bar' ? (
                            <BarChart data={categoryData as any[]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="categoryName"
                                    stroke="#94A3B8"
                                    style={{ fontSize: '0.75rem' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    stroke="#94A3B8"
                                    style={{ fontSize: '0.75rem' }}
                                    tickFormatter={(value) => formatCurrency(value, data.currency)}
                                />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value, data.currency)}
                                    contentStyle={{
                                        background: 'rgba(30, 41, 59, 0.9)',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#F1F5F9',
                                    }}
                                />
                                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        ) : (
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="amount"
                                    nameKey="categoryName"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={(entry: any) => `${entry.categoryIcon} ${entry.categoryName}`}
                                    labelLine={{ stroke: '#94A3B8' }}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value, data.currency)}
                                    contentStyle={{
                                        background: 'rgba(30, 41, 59, 0.9)',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#F1F5F9',
                                    }}
                                />
                            </PieChart>
                        )}
                    </ResponsiveContainer>

                    {/* Top Categories List */}
                    <div className="top-categories-section">
                        <h4 style={{ marginBottom: 'var(--spacing-md)' }}>
                            Top Categories ({formatCurrency(totalExpenses, data.currency)} total)
                        </h4>
                        <div className="top-categories-list">
                            {categoryData.slice(0, 5).map((category) => (
                                <div key={category.categoryId} className="category-breakdown-item">
                                    <div className="category-info">
                                        <span className="category-icon">{category.categoryIcon}</span>
                                        <span className="category-name">{category.categoryName}</span>
                                    </div>
                                    <div className="category-stats">
                                        <span className="category-amount">
                                            {formatCurrency(category.amount, data.currency)}
                                        </span>
                                        <span className="category-percentage">
                                            {category.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="category-progress-bar">
                                        <div
                                            className="category-progress-fill"
                                            style={{
                                                width: `${category.percentage}%`,
                                                backgroundColor: category.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CategoryBreakdown;
