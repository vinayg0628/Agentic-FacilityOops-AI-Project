import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FacilityProvider } from './context/FacilityContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { IngestDataModal } from './components/common/IngestDataModal';

import { DashboardPage } from './pages/DashboardPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <FacilityProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
          
          {/* Top Navigation Bar */}
          <Navbar activeAlertsCount={3} />

          {/* Main Body Layout */}
          <div className="flex flex-1">
            <Sidebar />

            <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/energy" element={<MonitoringPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>

          <IngestDataModal />
        </div>
      </Router>
    </FacilityProvider>
  );
}

export default App;
