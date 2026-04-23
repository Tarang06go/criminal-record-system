import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../services/api";

// ── Helpers ──────────────────────────────────────────────────
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
  if (verdict === "Guilty")      return "pill pill-green";
  if (verdict === "Pending")     return "pill pill-yellow";
  if (verdict === "Under Trial") return "pill pill-orange";
  return "pill pill-slate";
}

// ── Component ─────────────────────────────────────────────────
export default function DashboardPage() {
  const [state, setState] = useState({
    loading: true, error: "",
    cases: [], officers: [], criminals: [],
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
            ...p, loading: false,
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
      detail: "All case files visible to the current session.",
      barColor: "var(--blue)",
    },
    {
      label:  "Open Cases",
      value:  loading ? "—" : openCases,
      detail: "Pending or Under Trial — require attention.",
      barColor: "var(--orange)",
    },
    {
      label:  "Officers",
      value:  loading ? "—" : officers.length,
      detail: "Active officers returned by the protected API.",
      barColor: "var(--green)",
    },
    {
      label:  "Criminals",
      value:  loading ? "—" : criminals.length,
      detail: "Criminal profiles with linked offences and cases.",
      barColor: "var(--red)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── Row 1: Hero + Pulse ── */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr" }}>
        <style>{`
          @media (min-width: 900px) {
            .dash-row1 { grid-template-columns: 2fr 1fr !important; }
          }
        `}</style>
        <div className="dash-row1" style={{
          display: "grid", gap: "1rem", gridTemplateColumns: "1fr",
        }}>

          {/* Hero */}
          <div className="hero-banner">
            <div>
              <p className="hero-kicker">System Snapshot</p>
              <h1 className="hero-title">
                Centralized visibility for cases,
                officers, and criminal records.
              </h1>
              <p className="hero-sub">
                Real-time operational data from the secured backend.
                All figures reflect the current authenticated session.
              </p>
              {error && <div className="hero-error">{error}</div>}
            </div>
          </div>

          {/* Pulse */}
          <div className="pulse-card">
            <div>
              <p className="pulse-mini-label" style={{ marginBottom: "0.5rem" }}>
                Open Cases
              </p>
              <div className="pulse-number">
                {loading ? "—" : openCases}
              </div>
              <p className="pulse-desc">
                {loading
                  ? "Loading metrics…"
                  : "cases need active courtroom attention."}
              </p>
            </div>
            <div className="pulse-footer">
              {[
                { label: "Total",    val: cases.length     },
                { label: "Officers", val: officers.length  },
                { label: "Criminal", val: criminals.length },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="pulse-mini-label">{label}</span>
                  <span className="pulse-mini-val">
                    {loading ? "—" : val}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Row 2: Stat cards ── */}
      <section style={{
        display: "grid", gap: "0.85rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div
              className="stat-card-bar"
              style={{ background: s.barColor }}
            />
            <p className="stat-card-label">{s.label}</p>
            <p className="stat-card-value">{s.value}</p>
            <p className="stat-card-detail">{s.detail}</p>
          </div>
        ))}
      </section>

      {/* ── Row 3: Cases + Coverage ── */}
      <section style={{
        display: "grid", gap: "1rem",
        gridTemplateColumns: "1fr",
      }}>
        <style>{`
          @media (min-width: 900px) {
            .dash-row3 { grid-template-columns: 1.3fr 0.7fr !important; }
          }
        `}</style>
        <div className="dash-row3" style={{
          display: "grid", gap: "1rem", gridTemplateColumns: "1fr",
        }}>

          {/* Recent cases */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "1.25rem",
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: "1rem",
            }}>
              <div>
                <p className="panel-eyebrow">Recent Case View</p>
                <h2 className="panel-title">Case Highlights</h2>
              </div>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                padding: "0.2rem 0.55rem",
                borderRadius: "var(--r-sm)",
              }}>
                {loading ? "—" : `${recentCases.length} of ${cases.length}`}
              </span>
            </div>

            {loading ? (
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Loading…</p>
            ) : recentCases.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>No cases available.</p>
            ) : (
              recentCases.map((item) => (
                <div key={item.case_id} className="case-row">
                  <div>
                    <p className="case-row-id">Case #{item.case_id}</p>
                    <p className="case-row-court">{item.court_name}</p>
                    <p className="case-row-criminal">
                      {item.criminal_name || "Unknown criminal"}
                    </p>
                  </div>
                  <span className={verdictPillClass(item.verdict)}>
                    {item.verdict || "Unknown"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Officer coverage */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "1.25rem",
          }}>
            <p className="panel-eyebrow">Station Spread</p>
            <h2 className="panel-title" style={{ marginBottom: "1rem" }}>
              Officer Coverage
            </h2>

            {loading ? (
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Loading…</p>
            ) : topStations.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>No data.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {topStations.map(([station, count]) => (
                  <div key={station}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: "0.5rem",
                    }}>
                      <span style={{
                        fontSize: "0.82rem", fontWeight: 500,
                        color: "var(--text-primary)",
                      }}>
                        {station}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                        color: "var(--text-muted)",
                      }}>
                        {count}
                      </span>
                    </div>
                    <div className="station-bar-track">
                      <div
                        className="station-bar-fill"
                        style={{
                          width: `${Math.max(8, (count / maxOfficers) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && officers.length > 0 && (
              <div style={{
                marginTop: "1.25rem", paddingTop: "0.85rem",
                borderTop: "1px solid var(--border)",
              }}>
                <p className="panel-eyebrow">Total deployed</p>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem", fontWeight: 700,
                  color: "var(--text-primary)", letterSpacing: "-0.02em",
                }}>
                  {officers.length}
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
