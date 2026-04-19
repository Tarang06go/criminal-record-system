export default function TopBar({ title, user, onMenuClick, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="topbar-menu-btn md:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-2">
            <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="topbar-title-block">
          <span className="topbar-kicker">Operational View</span>
          <h2 className="topbar-title">{title}</h2>
        </div>
      </div>

      <div className="topbar-right">
        {/* User info chip */}
        <div className="topbar-user">
          <p className="topbar-user-name">{user?.username || "User"}</p>
          <p className="topbar-user-role">{user?.role || "—"}</p>
        </div>

        {/* Logout */}
        <button
          type="button"
          className="topbar-logout"
          onClick={onLogout}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
