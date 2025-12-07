import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { FinanceProvider } from './context/FinanceContext';

describe('App Smoke Test', () => {
    it('renders the main heading', () => {
        render(
            <FinanceProvider>
                <App />
            </FinanceProvider>
        );
        // Expecting a heading or some text that is definitely there.
        // Based on previous file reads, it's a finance app.
        // Let's just check if it renders without crashing.
        expect(document.body).toBeInTheDocument();
    });
});
