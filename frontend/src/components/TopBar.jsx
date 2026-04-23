export default function TopBar({ title, user, onMenuClick, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <svg viewBox="0 0 16 14" width="16" height="14" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M1 1h14M1 7h14M1 13h14" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--text-faint)",
          }}>
            CRS
          </span>
          <span style={{ color: "var(--text-faint)", fontSize: "0.75rem" }}>/</span>
          <h1 className="topbar-page-title">{title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        {/* User chip */}
        <div className="topbar-user">
          <p className="topbar-user-name">
            {(user?.username || "User").split("@")[0]}
          </p>
          <p className="topbar-user-role">{user?.role || "—"}</p>
        </div>

        {/* Logout */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onLogout}
          style={{ flexShrink: 0 }}
        >
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
          </svg>
          Log out
        </button>
      </div>
    </header>
  );
}