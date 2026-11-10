import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);

  return (
    <div
      className="min-h-screen bg-[#F7F9FC]"
      style={{ "--sidebar-width": sidebarExpanded ? `${sidebarWidth}px` : "76px" }}
    >
      <Navbar />

      <Sidebar
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
        width={sidebarWidth}
        setWidth={setSidebarWidth}
      />

      <main className="min-w-0 overflow-auto p-4 pb-24 transition-[margin-left] duration-200 sm:p-6 sm:pb-24 lg:ml-[var(--sidebar-width)] lg:p-8 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
