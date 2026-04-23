import { NavLink } from "react-router-dom";

// ── Inline SVG icons (no lucide-react dependency) ──────────
function IconGrid() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="1" y="1" width="6" height="6" rx="1.2" />
      <rect x="9" y="1" width="6" height="6" rx="1.2" />
      <rect x="1" y="9" width="6" height="6" rx="1.2" />
      <rect x="9" y="9" width="6" height="6" rx="1.2" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 4.5A1.5 1.5 0 012.5 3H6l1.5 2H13.5A1.5 1.5 0 0115 6.5v5A1.5 1.5 0 0113.5 13h-11A1.5 1.5 0 011 11.5v-7z" />
    </svg>
  );
}

function IconBadge() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="6" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M8 1l.8 2.5H11.5l-2.2 1.6.8 2.6L8 6.1 5.9 7.7l.8-2.6L4.5 3.5H7.2L8 1z" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1 13.5c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <circle cx="11.5" cy="5" r="2" opacity="0.7" />
      <path d="M13.5 12c0-1.9-1-3.5-2.5-4.3" opacity="0.7" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8">
      <path d="M8 1L2 3.5v4.5C2 11 4.7 13.8 8 15c3.3-1.2 6-4 6-7V3.5L8 1z" strokeLinejoin="round" />
    </svg>
  );
}

// ── Nav link component ──────────────────────────────────────
function SideNavLink({ to, icon, label, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        ["nav-link", isActive ? "active" : ""].filter(Boolean).join(" ")
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

// ── Sidebar ─────────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const initials = (user?.username || "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { to: "/",          icon: <IconGrid />,   label: "Dashboard" },
    { to: "/cases",     icon: <IconFolder />, label: "Cases"     },
    ...(user?.role === "admin"
      ? [{ to: "/officers", icon: <IconBadge />, label: "Officers" }]
      : []),
    { to: "/criminals", icon: <IconUsers />,  label: "Criminals" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <aside className={`sidebar${isOpen ? " open" : ""}`}>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <IconShield />
          </div>
          <div className="sidebar-brand-text">
            <p className="sidebar-brand-name">CRS Command</p>
            <p className="sidebar-brand-sub">Law Enforcement</p>
          </div>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <p className="sidebar-user-name">
              {(user?.username || "User").split("@")[0]}
            </p>
            <p className="sidebar-user-role">{user?.role || "—"}</p>
          </div>
        </div>

        {/* Nav */}
        <p className="sidebar-section">Navigation</p>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <SideNavLink key={item.to} {...item} onClose={onClose} />
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <span className="sidebar-status-dot" />
          <span className="sidebar-status-text">All systems operational</span>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute", top: "0.75rem", right: "0.75rem",
            display: "none",
            width: "28px", height: "28px",
            alignItems: "center", justifyContent: "center",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-sm)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
          className="mobile-close-btn"
          aria-label="Close menu"
        >
          <svg viewBox="0 0 14 14" width="12" height="12" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </aside>

      <style>{`
        @media (max-width: 767px) {
          .mobile-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}