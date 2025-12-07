import React from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Dashboard from './components/Dashboard';
import './index.css';

const App: React.FC = () => {
  return (
    <FinanceProvider>
      <Dashboard />
    </FinanceProvider>
  );
};

export default App;
