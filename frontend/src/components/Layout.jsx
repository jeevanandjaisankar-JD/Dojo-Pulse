import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar with profile pinned permanently on right */}
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Sidebar with navigation actions */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
