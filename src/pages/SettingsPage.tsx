import React from 'react';
import Settings from '../components/Settings';
import CategoryManager from '../components/CategoryManager';
import '../components/Dashboard.css';

const SettingsPage: React.FC = () => {
    return (
        <div className="space-y-8" style={{ maxWidth: '56rem', margin: '0 auto' }}>
            <header className="page-header">
                <h2 className="page-title">Settings</h2>
                <p className="page-subtitle">Configure your currency, categories and data.</p>
            </header>

            <Settings />

            <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Category Management</h3>
                <CategoryManager />
            </div>
        </div>
    );
};

export default SettingsPage;
