// frontend/src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import api, { getApiErrorMessage } from "../services/api";

function getOpenCaseCount(cases) {
  return cases.filter((item) =>
    ["Pending", "Under Trial"].includes(item.verdict)
  ).length;
}

function getTopStations(officers) {
  const grouped = officers.reduce((acc, officer) => {
    const station = officer.station || "Unknown Station";
    acc[station] = (acc[station] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
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

    async function loadDashboardData() {
      try {
        const [casesRes, officersRes, criminalsRes] = await Promise.all([
          api.get("/cases"),
          api.get("/officers"),
          api.get("/criminals"),
        ]);

        if (!ignore) {
          // Backend wraps in { success, data: [...] } — handle both shapes
          const cases = Array.isArray(casesRes.data)
            ? casesRes.data
            : casesRes.data?.data ?? [];
          const officers = Array.isArray(officersRes.data)
            ? officersRes.data
            : officersRes.data?.data ?? [];
          const criminals = Array.isArray(criminalsRes.data)
            ? criminalsRes.data
            : criminalsRes.data?.data ?? [];

          setState({ loading: false, error: "", cases, officers, criminals });
        }
      } catch (error) {
        if (!ignore) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: getApiErrorMessage(error, "Unable to load dashboard data."),
          }));
        }
      }
    }

    loadDashboardData();
    return () => { ignore = true; };
  }, []);

  const topStations = getTopStations(state.officers);
  const recentCases = state.cases.slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="panel overflow-hidden bg-gradient-to-br from-[#fff9f1] via-[#fff2e3] to-[#f5d9c1] p-6 sm:p-8">
          <p className="soft-label">System Snapshot</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">
            Centralized visibility for cases, officers, and criminal records.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Review operational movement across the entire criminal record system
            with real-time data pulled from your secured backend.
          </p>
          {state.error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </div>
          )}
        </div>

        <div className="panel p-6">
          <p className="soft-label">Status Signal</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Operations Pulse</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {state.loading
              ? "Refreshing command metrics..."
              : `${getOpenCaseCount(state.cases)} cases currently need continued courtroom attention.`}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Cases"
          value={state.loading ? "..." : state.cases.length}
          detail="All case files currently visible to the authenticated user."
          accentClass="bg-gradient-to-br from-[#d96c47] to-[#f0a37d]"
        />
        <StatCard
          label="Open Cases"
          value={state.loading ? "..." : getOpenCaseCount(state.cases)}
          detail="Cases with Pending or Under Trial verdict states."
          accentClass="bg-gradient-to-br from-[#c39143] to-[#f0cf8f]"
        />
        <StatCard
          label="Officers"
          value={state.loading ? "..." : state.officers.length}
          detail="Officer records available through the protected API."
          accentClass="bg-gradient-to-br from-[#1d3858] to-[#5d88b0]"
        />
        <StatCard
          label="Criminals"
          value={state.loading ? "..." : state.criminals.length}
          detail="Criminal profiles with linked offences and case summaries."
          accentClass="bg-gradient-to-br from-[#5f8676] to-[#96c2b1]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="soft-label">Recent Case View</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Case Highlights</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {state.loading ? (
              <p className="text-sm text-slate-500">Loading cases...</p>
            ) : recentCases.length === 0 ? (
              <p className="text-sm text-slate-500">No cases available.</p>
            ) : (
              recentCases.map((item) => (
                <div key={item.case_id} className="rounded-3xl border border-slate-200/80 bg-white/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Case #{item.case_id}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-ink">{item.court_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Criminal: {item.criminal_name || "Unknown"}
                      </p>
                    </div>
                    <span className="status-pill bg-slate-100 text-slate-700">
                      {item.verdict || "Unknown"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-6">
          <p className="soft-label">Station Spread</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Officer Coverage</h2>
          <div className="mt-6 space-y-4">
            {state.loading ? (
              <p className="text-sm text-slate-500">Loading station data...</p>
            ) : topStations.length === 0 ? (
              <p className="text-sm text-slate-500">No officer data available.</p>
            ) : (
              topStations.map(([station, count]) => (
                <div key={station} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">{station}</span>
                    <span className="text-slate-500">{count} officers</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#1d3858] to-[#d96c47]"
                      style={{
                        width: `${Math.max(18, (count / Math.max(state.officers.length, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}