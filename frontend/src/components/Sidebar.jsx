import { NavLink } from "react-router-dom";

function NavItem({ to, label, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        ["sidebar-link", isActive ? "sidebar-link--active" : ""].join(" ")
      }
    >
      <span>{label}</span>
      <span className="sidebar-link-dot" aria-hidden="true" />
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Cases",     path: "/cases" },
    ...(user?.role === "admin" ? [{ label: "Officers", path: "/officers" }] : []),
    { label: "Criminals", path: "/criminals" },
  ];

  // Derive initials for avatar
  const initials = (user?.username || "U")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-40 md:static md:translate-x-0 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <p className="sidebar-brand-kicker">Criminal Record Suite</p>
          <p className="sidebar-brand-name">Command Center</p>
        </div>

        {/* User chip */}
        <div className="sidebar-user-pill">
          <div className="sidebar-user-avatar">{initials}</div>
          <div>
            <p className="sidebar-user-name">
              {user?.username?.split("@")[0] || "User"}
            </p>
            <p className="sidebar-user-role">{user?.role || "role"}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">Navigation</p>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              label={item.label}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer-block">
          <span className="sidebar-status-dot">System active</span>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.28)",
              marginTop: "0.5rem",
              lineHeight: 1.5,
            }}
          >
            JWT-protected · Role-aware data
          </p>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex items-center justify-center rounded-lg border border-white/10 bg-white/8 p-1.5 text-white/60 transition hover:bg-white/14 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-2">
            <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
          </svg>
        </button>
      </aside>
    </>
  );
}
