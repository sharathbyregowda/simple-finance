import React from 'react';
import Settings from '../components/Settings';
import CategoryManager from '../components/CategoryManager';
import '../components/Dashboard.css';

const SettingsPage: React.FC = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-muted">Configure your currency, categories and data.</p>
            </header>

            <Settings />

            <div className="pt-8 border-t border-[var(--border-color)]">
                <h3 className="text-xl font-bold mb-6">Category Management</h3>
                <CategoryManager />
            </div>
        </div>
    );
};

export default SettingsPage;
