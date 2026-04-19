import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../services/auth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const pageTitles = {
  "/":          "Dashboard",
  "/cases":     "Cases",
  "/officers":  "Officers",
  "/criminals": "Criminals",
};

export default function AppLayout() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen md:flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col px-4 py-4 sm:px-6 lg:px-7">
        <TopBar
          title={currentTitle}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
