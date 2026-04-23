import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../services/auth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const PAGE_TITLES = {
  "/":          "Dashboard",
  "/cases":     "Cases",
  "/officers":  "Officers",
  "/criminals": "Criminals",
};

export default function AppLayout() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user         = JSON.parse(localStorage.getItem("user") || "null");
  const currentTitle = PAGE_TITLES[location.pathname] ?? "Dashboard";

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <TopBar
          title={currentTitle}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
