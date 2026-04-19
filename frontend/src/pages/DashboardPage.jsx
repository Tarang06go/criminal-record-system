import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../services/api";

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

function verdictPillClass(verdict) {
  if (verdict === "Guilty")                                return "verdict-guilty";
  if (verdict === "Pending" || verdict === "Under Trial")  return "verdict-pending";
  return "verdict-default";
}

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
          const cases     = Array.isArray(casesRes.data)     ? casesRes.data     : casesRes.data?.data     ?? [];
          const officers  = Array.isArray(officersRes.data)  ? officersRes.data  : officersRes.data?.data  ?? [];
          const criminals = Array.isArray(criminalsRes.data) ? criminalsRes.data : criminalsRes.data?.data ?? [];

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

  const stats = [
    {
      label:  "Total Cases",
      value:  loading ? "—" : cases.length,
      detail: "All case files visible to the authenticated session.",
      accent: "stat-item--ember",
    },
    {
      label:  "Open Cases",
      value:  loading ? "—" : openCases,
      detail: "Pending or Under Trial — require active attention.",
      accent: "stat-item--gold",
    },
    {
      label:  "Officers",
      value:  loading ? "—" : officers.length,
      detail: "Active officer records returned by the protected API.",
      accent: "stat-item--ocean",
    },
    {
      label:  "Criminals",
      value:  loading ? "—" : criminals.length,
      detail: "Criminal profiles with linked offences and cases.",
      accent: "stat-item--sage",
    },
  ];

  return (
    <div className="space-y-5">

      {/* Row 1 — Hero + Pulse */}
      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">

        {/* Hero */}
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
            {error && <div className="dash-hero-error">{error}</div>}
          </div>
        </div>

        {/* Pulse */}
        <div className="panel dash-pulse">
          <span className="soft-label">Operations Pulse</span>
          <div>
            <div className="dash-pulse-number">
              {loading ? "—" : openCases}
            </div>
            <p className="dash-pulse-desc">
              {loading ? "Loading metrics…" : "cases need courtroom attention."}
            </p>
          </div>
          <div className="flex gap-5" style={{ paddingTop: "1rem", borderTop: "1px solid rgba(15,25,35,0.07)", marginTop: "auto" }}>
            <div>
              <span className="soft-label" style={{ display: "block", marginBottom: "0.2rem" }}>Total</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.88rem", fontWeight: 500, color: "var(--ink)" }}>
                {loading ? "—" : cases.length}
              </span>
            </div>
            <div>
              <span className="soft-label" style={{ display: "block", marginBottom: "0.2rem" }}>Officers</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.88rem", fontWeight: 500, color: "var(--ink)" }}>
                {loading ? "—" : officers.length}
              </span>
            </div>
            <div>
              <span className="soft-label" style={{ display: "block", marginBottom: "0.2rem" }}>Criminals</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.88rem", fontWeight: 500, color: "var(--ink)" }}>
                {loading ? "—" : criminals.length}
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* Row 2 — Stat items */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`panel stat-item ${s.accent}`}>
            <span className="stat-item-label">{s.label}</span>
            <span className="stat-item-value">{s.value}</span>
            <span className="stat-item-detail">{s.detail}</span>
          </div>
        ))}
      </section>

      {/* Row 3 — Recent Cases + Officer Coverage */}
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">

        {/* Recent Cases */}
        <div className="panel p-5">
          <div className="flex items-center justify-between" style={{ marginBottom: "1.25rem" }}>
            <div>
              <span className="soft-label">Recent Case View</span>
              <h2 style={{ marginTop: "0.3rem", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)" }}>
                Case Highlights
              </h2>
            </div>
            <span style={{
              fontFamily: "var(--mono)", fontSize: "0.65rem",
              letterSpacing: "0.12em", color: "var(--muted)",
              border: "1px solid rgba(15,25,35,0.09)",
              background: "#fff",
              padding: "0.2rem 0.55rem", borderRadius: "0.4rem",
            }}>
              {loading ? "—" : `${recentCases.length} of ${cases.length}`}
            </span>
          </div>

          {loading ? (
            <p style={{ fontSize: "0.83rem", color: "var(--muted)", fontFamily: "var(--mono)" }}>Loading cases…</p>
          ) : recentCases.length === 0 ? (
            <p style={{ fontSize: "0.83rem", color: "var(--muted)" }}>No cases available.</p>
          ) : (
            <ul className="dash-case-list">
              {recentCases.map((item) => (
                <li key={item.case_id} className="dash-case-item">
                  <div>
                    <p className="dash-case-id">Case #{item.case_id}</p>
                    <p className="dash-case-court">{item.court_name}</p>
                    <p className="dash-case-criminal">
                      {item.criminal_name || "Unknown criminal"}
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

        {/* Officer Coverage */}
        <div className="panel p-5">
          <span className="soft-label">Station Spread</span>
          <h2 style={{ marginTop: "0.3rem", marginBottom: "1.25rem", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)" }}>
            Officer Coverage
          </h2>

          {loading ? (
            <p style={{ fontSize: "0.83rem", color: "var(--muted)", fontFamily: "var(--mono)" }}>Loading station data…</p>
          ) : topStations.length === 0 ? (
            <p style={{ fontSize: "0.83rem", color: "var(--muted)" }}>No officer data available.</p>
          ) : (
            <div className="space-y-4">
              {topStations.map(([station, count]) => (
                <div key={station}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--ink)" }}>
                      {station}
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--muted)" }}>
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

          {!loading && officers.length > 0 && (
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(15,25,35,0.07)" }}>
              <span className="soft-label">Total deployed</span>
              <p style={{ fontFamily: "var(--mono)", fontSize: "1.25rem", fontWeight: 500, color: "var(--ink)", marginTop: "0.3rem" }}>
                {officers.length}
              </p>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
