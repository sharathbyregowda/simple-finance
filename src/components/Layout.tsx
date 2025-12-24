import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, Receipt, Settings, Menu, X } from 'lucide-react';
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
        { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-[var(--bg-app)] text-[var(--color-text-primary)]">
            {/* Sidebar Navigation */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-card)] border-r border-[var(--border-color)] 
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Simple Finance
                            </h1>
                            <p className="text-xs text-muted">Family Planning</p>
                        </div>
                        <button onClick={toggleMobileMenu} className="md:hidden text-muted hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-l-4 border-blue-500'
                                        : 'text-muted hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Month Selector (Sidebar Footer) */}
                    <div className="p-4 border-t border-[var(--border-color)] bg-black/20">
                        <label className="text-xs text-muted uppercase tracking-wider font-semibold mb-2 block">
                            Viewing Period
                        </label>
                        <select
                            className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                            value={data.currentMonth}
                            onChange={(e) => setCurrentMonth(e.target.value)}
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
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex justify-between items-center">
                    <span className="font-bold">Simple Finance</span>
                    <button onClick={toggleMobileMenu} className="text-white">
                        <Menu size={24} />
                    </button>
                </div>

                {/* Content Scroller */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
