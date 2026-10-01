import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />

      <div className="flex">
        {/* Responsive Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="min-w-0 flex-1 overflow-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}