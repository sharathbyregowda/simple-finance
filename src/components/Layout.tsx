import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, Receipt, Calculator, Settings, Menu, X, Info } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatMonth } from '../utils/calculations';
import './Dashboard.css'; // Reusing dashboard styles for now

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { data, setCurrentMonth } = useFinance();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const navItems = [
        { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/reports', icon: <PieChart size={20} />, label: 'Reports' },
        { to: '/transactions', icon: <Receipt size={20} />, label: 'Transactions' },
        { to: '/calculators', icon: <Calculator size={20} />, label: 'Calculators' },
        { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
        { to: '/about', icon: <Info size={20} />, label: 'About' },
    ];

    return (
        <div className="app-layout">
            {/* Sidebar Navigation */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="flex flex-col h-full" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Logo Area */}
                    <div className="sidebar-header">
                        <div>
                            <h1 className="brand-title">
                                Simple Finance
                            </h1>
                            <p className="brand-subtitle">Clear money reviews over time</p>
                        </div>
                        <button onClick={toggleMobileMenu} className="md:hidden text-muted hover:text-white" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'none' /* Handled by media query via class if needed, but keeping simple for now */ }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="sidebar-nav">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {/* Main Header (Logo/Menu on Mobile, Selector on Desktop) */}
                <header className="main-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--spacing-md) var(--spacing-xl)',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    minHeight: '4rem'
                }}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleMobileMenu}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'inherit',
                                cursor: 'pointer',
                                display: 'none' // Hidden by default (desktop)
                            }}
                            className="mobile-menu-btn" // We'll add media query for this class if needed, or inline style logic
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold md:hidden mobile-brand" style={{ display: 'none' }}>Simple Finance</span>
                    </div>

                    {/* Desktop/Global Actions */}
                    <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                        <div className="month-selector-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label className="text-sm text-muted font-medium" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                Period:
                            </label>
                            <select
                                className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                                value={data.currentMonth}
                                onChange={(e) => setCurrentMonth(e.target.value)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: 'var(--bg-app)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--color-text-primary)',
                                    minWidth: '140px'
                                }}
                            >
                                {(() => {
                                    const months = Array.from(
                                        new Set([
                                            ...data.expenses.map((e) => e.month),
                                            ...data.incomes.map((i) => i.month),
                                            data.currentMonth,
                                        ])
                                    ).filter((m) => !m.endsWith('-ALL'));

                                    const years = Array.from(new Set(months.map((m) => m.split('-')[0])));
                                    years.forEach((year) => months.push(`${year}-ALL`));

                                    return months
                                        .sort((a, b) => b.localeCompare(a))
                                        .map((month) => (
                                            <option key={month} value={month}>
                                                {formatMonth(month)}
                                            </option>
                                        ));
                                })()}
                            </select>
                        </div>
                    </div>
                </header>

                {/* Content Scroller */}
                <div className="content-scroll-area">
                    <div className="page-container">
                        {children}
                    </div>
                </div>
            </main>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
