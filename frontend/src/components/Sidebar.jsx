// frontend/src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

function SidebarLink({ item, onClose }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) =>
        [
          "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
          isActive
            ? "bg-white/14 text-white shadow-lg shadow-black/10"
            : "text-slate-200/90 hover:bg-white/8 hover:text-white",
        ].join(" ")
      }
    >
      <span>{item.label}</span>
      <span className="h-2 w-2 rounded-full bg-current opacity-60 transition group-hover:opacity-100" />
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  // ✅ Read user inside component so it's always fresh after login
 const user = JSON.parse(localStorage.getItem("user") || "null");

  const navigationItems = [
    { label: "Dashboard", path: "/" },
    { label: "Cases", path: "/cases" },
    ...(user?.role === "admin" ? [{ label: "Officers", path: "/officers" }] : [])
    ,{ label: "Criminals", path: "/criminals" },
  ];

  return (
    <>
      {/* Overlay (mobile) */}
      <div
        className={`fixed inset-0 z-30 bg-slate-950/35 transition md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-hidden bg-gradient-to-b from-[#132944] via-[#1c3a5f] to-[#365f72] px-6 py-6 text-white shadow-2xl shadow-slate-900/30 transition-transform md:static md:translate-x-0 md:rounded-r-[2rem] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <NavLink to="/" onClick={onClose} className="space-y-2">
            <p className="soft-label text-slate-200/70">Criminal Record Suite</p>
            <h1 className="text-2xl font-semibold leading-tight text-white">
              Command Center
            </h1>
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20 md:hidden"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 rounded-2xl bg-white/10 p-4">
          <p className="text-sm font-semibold">{user?.username || "User"}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
            {user?.role || "Role"}
          </p>
        </div>

        {/* Info Panel */}
        <div className="panel mb-6 bg-white/8 p-4 text-white shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-200/70">
            Active Workspace
          </p>
          <p className="mt-3 text-xl font-semibold leading-tight text-ink">
  Criminal Record Management System
</p>
<p className="mt-2 text-sm text-slate-600">
  Monitor investigations, officers, and criminal records in one place.
</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <SidebarLink key={item.path} item={item} onClose={onClose} />
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto rounded-3xl border border-white/10 bg-white/8 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-200/70">
            Security Mode
          </p>
          <p className="mt-2 text-sm text-slate-100/80">
            JWT-protected access with role-aware data visibility.
          </p>
        </div>
      </aside>
    </>
  );
}