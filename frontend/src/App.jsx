import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FacilityProvider } from './context/FacilityContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/LandingPage';

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
import { OccupancyPage } from './pages/occupancy/OccupancyPage';
import { OccupancyAnalyticsPage } from './pages/occupancy/OccupancyAnalyticsPage';
import { OccupancyHeatmapPage } from './pages/occupancy/OccupancyHeatmapPage';
import { SecurityPage } from './pages/security/SecurityPage';
import { SecurityAlertsPage } from './pages/security/SecurityAlertsPage';
import { IncidentPage } from './pages/security/IncidentPage';
import { IncidentDetailPage } from './pages/security/IncidentDetailPage';

import ExecutiveDashboard from './pages/executive/ExecutiveDashboard';
import CostDashboard from './pages/cost/CostDashboard';
import OptimizationCenter from './pages/optimization/OptimizationCenter';
import CrossAgentInsights from './pages/intelligence/CrossAgentInsights';
import AskFacilityAI from './pages/facility-ai/AskFacilityAI';

export function App() {
  return (
    <FacilityProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Operational FacilityOps Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/energy" element={<MonitoringPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Maintenance */}
            <Route path="/maintenance" element={<MaintenanceDashboard />} />
            <Route path="/maintenance/equipment" element={<EquipmentPage />} />
            <Route path="/maintenance/health" element={<HealthScoresPage />} />
            <Route path="/maintenance/predictions" element={<PredictionsPage />} />
            <Route path="/maintenance/schedule" element={<SchedulePage />} />
            <Route path="/maintenance/alerts" element={<AlertsManagementPage />} />
            
            {/* Occupancy & Security */}
            <Route path="/occupancy" element={<OccupancyPage />} />
            <Route path="/occupancy/analytics" element={<OccupancyAnalyticsPage />} />
            <Route path="/occupancy/heatmap" element={<OccupancyHeatmapPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/security/alerts" element={<SecurityAlertsPage />} />
            <Route path="/security/incidents" element={<IncidentPage />} />
            <Route path="/security/incidents/:id" element={<IncidentDetailPage />} />
            
            {/* Cost Optimization & Intelligence (Milestone 4) */}
            <Route path="/executive" element={<ExecutiveDashboard />} />
            <Route path="/cost" element={<CostDashboard />} />
            <Route path="/optimization" element={<OptimizationCenter />} />
            <Route path="/intelligence" element={<CrossAgentInsights />} />
            <Route path="/facility-ai" element={<AskFacilityAI />} />
          </Route>
        </Routes>
      </Router>
    </FacilityProvider>
  );
}

export default App;
