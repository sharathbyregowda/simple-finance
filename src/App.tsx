import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import TransactionsPage from './pages/TransactionsPage';
import CalculatorsPage from './pages/CalculatorsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import OnboardingPage from './pages/OnboardingPage';
import RecurringManager from './components/RecurringManager';
import './index.css';

const AppRoutes: React.FC = () => {
  const { data } = useFinance();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If not onboarded and not on onboarding page, redirect to onboarding
    if (data.isOnboarded === false && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [data.isOnboarded, location.pathname, navigate]);

  // If strictly not onboarded, only show onboarding routes
  // This prevents flashing of main layout or access to other routes via URL
  if (data.isOnboarded === false) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // Main app routes
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/calculators" element={<CalculatorsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/recurring" element={<RecurringManager />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <FinanceProvider>
        <AppRoutes />
        <SpeedInsights />
      </FinanceProvider>
    </Router>
  );
};

export default App;
