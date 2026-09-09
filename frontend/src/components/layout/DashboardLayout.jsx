import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { IngestDataModal } from '../common/IngestDataModal';

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] antialiased">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Body Layout */}
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <IngestDataModal />
    </div>
  );
}

export default DashboardLayout;
