import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="transition-all duration-300 ml-64">
        <Navbar />

        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}