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
import { MaintenanceDashboard } from './pages/maintenance/MaintenanceDashboard';
import { EquipmentPage } from './pages/maintenance/EquipmentPage';
import { HealthScoresPage } from './pages/maintenance/HealthScoresPage';
import { PredictionsPage } from './pages/maintenance/PredictionsPage';
import { SchedulePage } from './pages/maintenance/SchedulePage';
import { AlertsManagementPage } from './pages/maintenance/AlertsManagementPage';

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
                <Route path="/maintenance" element={<MaintenanceDashboard />} />
                <Route path="/maintenance/equipment" element={<EquipmentPage />} />
                <Route path="/maintenance/health" element={<HealthScoresPage />} />
                <Route path="/maintenance/predictions" element={<PredictionsPage />} />
                <Route path="/maintenance/schedule" element={<SchedulePage />} />
                <Route path="/maintenance/alerts" element={<AlertsManagementPage />} />
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
