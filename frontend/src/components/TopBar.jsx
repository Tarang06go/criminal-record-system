export default function TopBar({ title, user, onMenuClick, onLogout }) {
  return (
    <header className="panel sticky top-4 z-20 mb-6 flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 md:hidden"
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div>
          <p className="soft-label">Operational View</p>
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl bg-slate-100/80 px-4 py-2 text-right sm:block">
          <p className="text-sm font-semibold text-slate-700">
            {user?.username || "Authenticated User"}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {user?.role || "User"}
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-2xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:translate-y-[-1px] hover:bg-[#bf5432]"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
