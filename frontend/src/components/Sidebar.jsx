import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />

      <div className="flex">
        {/* Sidebar handles its own desktop/mobile responsive layout */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}