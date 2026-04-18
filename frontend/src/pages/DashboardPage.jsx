// frontend/src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../services/api";

// ── Helpers ──────────────────────────────────────────────
function getOpenCaseCount(cases) {
  return cases.filter((c) =>
    ["Pending", "Under Trial"].includes(c.verdict)
  ).length;
}

function getTopStations(officers) {
  const grouped = officers.reduce((acc, o) => {
    const s = o.station || "Unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

// Returns CSS modifier class for verdict pill
function verdictPillClass(verdict) {
  if (verdict === "Guilty")                        return "verdict-guilty";
  if (verdict === "Pending" || verdict === "Under Trial") return "verdict-pending";
  return "verdict-default";
}

// ── Component ─────────────────────────────────────────────
export default function DashboardPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    cases: [],
    officers: [],
    criminals: [],
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [casesRes, officersRes, criminalsRes] = await Promise.all([
          api.get("/cases"),
          api.get("/officers"),
          api.get("/criminals"),
        ]);

        if (!ignore) {
          const cases = Array.isArray(casesRes.data)
            ? casesRes.data : casesRes.data?.data ?? [];
          const officers = Array.isArray(officersRes.data)
            ? officersRes.data : officersRes.data?.data ?? [];
          const criminals = Array.isArray(criminalsRes.data)
            ? criminalsRes.data : criminalsRes.data?.data ?? [];

          setState({ loading: false, error: "", cases, officers, criminals });
        }
      } catch (err) {
        if (!ignore)
          setState((p) => ({
            ...p,
            loading: false,
            error: getApiErrorMessage(err, "Unable to load dashboard data."),
          }));
      }
    }

    load();
    return () => { ignore = true; };
  }, []);

  const { loading, error, cases, officers, criminals } = state;
  const openCases   = getOpenCaseCount(cases);
  const topStations = getTopStations(officers);
  const recentCases = cases.slice(0, 5);
  const maxOfficers = Math.max(...topStations.map(([, n]) => n), 1);

  // ── Stat definitions — color accent per item ──
  const stats = [
    {
      label: "Total Cases",
      value: loading ? "—" : cases.length,
      detail: "All case files visible to the authenticated user.",
      accent: "stat-item--ember",
    },
    {
      label: "Open Cases",
      value: loading ? "—" : openCases,
      detail: "Pending or Under Trial verdicts requiring attention.",
      accent: "stat-item--gold",
    },
    {
      label: "Officers",
      value: loading ? "—" : officers.length,
      detail: "Active officer records available via the protected API.",
      accent: "stat-item--ocean",
    },
    {
      label: "Criminals",
      value: loading ? "—" : criminals.length,
      detail: "Criminal profiles with linked offences and cases.",
      accent: "stat-item--sage",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Row 1: Hero + Pulse — asymmetric 2:1 split ── */}
      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">

        {/* Hero — dark navy, not a warm gradient */}
        <div className="dash-hero">
          <span className="dash-hero-label">System Snapshot</span>
          <div>
            <h1 className="dash-hero-title">
              Centralized visibility for cases,<br />
              officers, and criminal records.
            </h1>
            <p className="dash-hero-sub">
              Real-time operational data pulled from your secured backend.
              All figures reflect the current authenticated session.
            </p>
            {error && (
              <div className="dash-hero-error">{error}</div>
            )}
          </div>
        </div>

        {/* Pulse — open case count, large mono number */}
        <div className="panel dash-pulse">
          <span className="soft-label">Operations Pulse</span>
          <div>
            <div className="dash-pulse-number">
              {loading ? "—" : openCases}
            </div>
            <p className="dash-pulse-desc">
              {loading
                ? "Loading metrics…"
                : "cases currently need courtroom attention."}
            </p>
          </div>
          {/* Small context labels */}
          <div className="flex gap-4 mt-2">
            <div>
              <span className="soft-label block mb-0.5">Total</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.85rem", fontWeight: 500 }}>
                {loading ? "—" : cases.length}
              </span>
            </div>
            <div>
              <span className="soft-label block mb-0.5">Officers</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.85rem", fontWeight: 500 }}>
                {loading ? "—" : officers.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Row 2: 4 stat items — left-border accent, no gradients ── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`panel stat-item ${s.accent}`}>
            <span className="stat-item-label">{s.label}</span>
            <span className="stat-item-value">{s.value}</span>
            <span className="stat-item-detail">{s.detail}</span>
          </div>
        ))}
      </section>

      {/* ── Row 3: Recent Cases + Officer Coverage — 55/45 split ── */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">

        {/* Recent Cases — flat list, not individual floating cards */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="soft-label">Recent Case View</span>
              <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}>
                Case Highlights
              </h2>
            </div>
            {/* Row count badge */}
            <span
              style={{
                fontFamily: "var(--mono)", fontSize: "0.65rem",
                letterSpacing: "0.12em", color: "#8898aa",
                border: "1px solid rgba(15,25,35,0.1)",
                padding: "0.2rem 0.55rem", borderRadius: "0.4rem",
              }}
            >
              {loading ? "—" : `${recentCases.length} of ${cases.length}`}
            </span>
          </div>

          {loading ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Loading cases…</p>
          ) : recentCases.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>No cases available.</p>
          ) : (
            <ul className="dash-case-list">
              {recentCases.map((item) => (
                <li key={item.case_id} className="dash-case-item">
                  <div>
                    <p className="dash-case-id">Case #{item.case_id}</p>
                    <p className="dash-case-court">{item.court_name}</p>
                    <p className="dash-case-criminal">
                      {item.criminal_name || "Unknown"}
                    </p>
                  </div>
                  <span className={`status-pill ${verdictPillClass(item.verdict)}`}>
                    {item.verdict || "Unknown"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Officer Coverage — flat bars, no gradient fill */}
        <div className="panel p-5">
          <span className="soft-label">Station Spread</span>
          <h2 className="mt-1 mb-5 text-xl font-semibold" style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}>
            Officer Coverage
          </h2>

          {loading ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Loading station data…</p>
          ) : topStations.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>No officer data available.</p>
          ) : (
            <div className="space-y-4">
              {topStations.map(([station, count]) => (
                <div key={station}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                      {station}
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "#8898aa" }}>
                      {count}
                    </span>
                  </div>
                  <div className="station-bar-track">
                    <div
                      className="station-bar-fill"
                      style={{ width: `${Math.max(8, (count / maxOfficers) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer total */}
          {!loading && officers.length > 0 && (
            <div
              className="mt-6 pt-4"
              style={{ borderTop: "1px solid rgba(15,25,35,0.07)" }}
            >
              <span className="soft-label">Total deployed</span>
              <p style={{ fontFamily: "var(--mono)", fontSize: "1.2rem", fontWeight: 500, color: "var(--ink)", marginTop: "0.25rem" }}>
                {officers.length}
              </p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
