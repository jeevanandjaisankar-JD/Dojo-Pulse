import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Navbar
          z-50 keeps it above the fixed sidebar
      */}
      <Navbar />

      {/* Sidebar
          Fixed from top:0 and z-40.
          Navbar visually overlaps it.
      */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`min-w-0 overflow-auto p-4 pb-24 transition-all duration-300 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}