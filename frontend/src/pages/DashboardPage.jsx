// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../services/api";

function getOpenCaseCount(cases) {
  return cases.filter((c) => ["Pending", "Under Trial"].includes(c.verdict)).length;
}

function getTopStations(officers) {
  const grouped = officers.reduce((acc, o) => {
    const station = o.station || "Unknown";
    acc[station] = (acc[station] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

function verdictPillClass(verdict) {
  if (verdict === "Guilty") return "verdict-guilty";
  if (verdict === "Pending" || verdict === "Under Trial") return "verdict-pending";
  return "verdict-default";
}

export default function DashboardPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    cases: [],
    officers: [],
    criminals: []
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [casesRes, officersRes, criminalsRes] = await Promise.all([
          api.get("/cases"),
          api.get("/officers"),
          api.get("/criminals")
        ]);

        if (!ignore) {
          const cases = Array.isArray(casesRes.data)
            ? casesRes.data
            : casesRes.data?.data ?? [];
          const officers = Array.isArray(officersRes.data)
            ? officersRes.data
            : officersRes.data?.data ?? [];
          const criminals = Array.isArray(criminalsRes.data)
            ? criminalsRes.data
            : criminalsRes.data?.data ?? [];

          setState({
            loading: false,
            error: "",
            cases,
            officers,
            criminals
          });
        }
      } catch (err) {
        if (!ignore) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: getApiErrorMessage(err, "Unable to load dashboard data.")
          }));
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const { loading, error, cases, officers, criminals } = state;
  const openCases = getOpenCaseCount(cases);
  const topStations = getTopStations(officers);
  const recentCases = cases.slice(0, 5);
  const maxOfficers = Math.max(...topStations.map(([, count]) => count), 1);

  const stats = [
    {
      label: "Total Cases",
      value: loading ? "—" : cases.length,
      detail: "All case files visible to the authenticated user.",
      accent: "dashboard-metric--ember"
    },
    {
      label: "Open Cases",
      value: loading ? "—" : openCases,
      detail: "Pending or Under Trial verdicts requiring attention.",
      accent: "dashboard-metric--gold"
    },
    {
      label: "Officers",
      value: loading ? "—" : officers.length,
      detail: "Active officer records available via the protected API.",
      accent: "dashboard-metric--ocean"
    },
    {
      label: "Criminals",
      value: loading ? "—" : criminals.length,
      detail: "Criminal profiles with linked offences and cases.",
      accent: "dashboard-metric--sage"
    }
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(18rem,0.95fr)]">
        <div className="dashboard-hero">
          <div>
            <span className="dashboard-hero-kicker">System Snapshot</span>
            <h1 className="dashboard-hero-title">
              Centralized visibility for cases, officers, and criminal records.
            </h1>
            <p className="dashboard-hero-copy">
              Real-time operational data pulled from your secured backend. All
              figures reflect the current authenticated session.
            </p>

            {error && <div className="dashboard-hero-error">{error}</div>}
          </div>

          <div className="dashboard-hero-meta">
            <span className="dashboard-meta-chip">Live records</span>
            <span className="dashboard-meta-chip">Protected workspace</span>
            <span className="dashboard-meta-chip">Operational summary</span>
          </div>
        </div>

        <div className="panel dashboard-pulse">
          <div>
            <span className="soft-label">Operations Pulse</span>
            <div className="dashboard-pulse-value">{loading ? "—" : openCases}</div>
            <p className="dashboard-pulse-copy">
              {loading
                ? "Loading metrics…"
                : "cases currently need courtroom attention."}
            </p>
          </div>

          <div className="dashboard-pulse-footer">
            <div>
              <span className="dashboard-mini-label">Total</span>
              <span className="dashboard-mini-value">{loading ? "—" : cases.length}</span>
            </div>
            <div>
              <span className="dashboard-mini-label">Officers</span>
              <span className="dashboard-mini-value">
                {loading ? "—" : officers.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`panel dashboard-metric ${stat.accent}`}>
            <span className="soft-label">{stat.label}</span>
            <span className="dashboard-metric-value">{stat.value}</span>
            <span className="dashboard-metric-copy">{stat.detail}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="soft-label">Recent Case View</span>
              <h2 className="dashboard-section-title">Case Highlights</h2>
              <p className="dashboard-section-sub">
                The most recent case records visible in your current session.
              </p>
            </div>

            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.64rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#7f8f9f",
                border: "1px solid rgba(15,25,35,0.1)",
                padding: "0.28rem 0.62rem",
                borderRadius: "999px",
                whiteSpace: "nowrap"
              }}
            >
              {loading ? "—" : `${recentCases.length} of ${cases.length}`}
            </span>
          </div>

          <div className="mt-5">
            {loading ? (
              <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
                Loading cases…
              </p>
            ) : recentCases.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
                No cases available.
              </p>
            ) : (
              <ul className="dashboard-case-list">
                {recentCases.map((item) => (
                  <li key={item.case_id} className="dashboard-case-row">
                    <div>
                      <p className="dashboard-case-id">Case #{item.case_id}</p>
                      <p className="dashboard-case-court">{item.court_name}</p>
                      <p className="dashboard-case-criminal">
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
        </div>

        <div className="panel p-5 sm:p-6">
          <span className="soft-label">Station Spread</span>
          <h2 className="dashboard-section-title">Officer Coverage</h2>
          <p className="dashboard-section-sub">
            Highest staff concentration by station in the current dataset.
          </p>

          <div className="mt-5 space-y-4">
            {loading ? (
              <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
                Loading station data…
              </p>
            ) : topStations.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
                No officer data available.
              </p>
            ) : (
              topStations.map(([station, count]) => (
                <div key={station} className="station-item">
                  <div className="station-meta">
                    <span className="station-name">{station}</span>
                    <span className="station-count">{count}</span>
                  </div>

                  <div className="station-track">
                    <div
                      className="station-bar"
                      style={{
                        width: `${Math.max(10, (count / maxOfficers) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && officers.length > 0 && (
            <div className="dashboard-total">
              <span className="soft-label">Total deployed</span>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "1.18rem",
                  fontWeight: 500,
                  color: "var(--ink)",
                  marginTop: "0.24rem"
                }}
              >
                {officers.length}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
