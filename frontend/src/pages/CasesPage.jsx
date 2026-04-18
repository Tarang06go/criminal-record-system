// src/pages/CasesPage.jsx
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

function verdictClass(verdict) {
  if (verdict === "Guilty") return "verdict-guilty";
  if (verdict === "Pending" || verdict === "Under Trial") return "verdict-pending";
  return "verdict-default";
}

function SearchIcon() {
  return (
    <svg
      className="cases-search-icon"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 10l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CasesPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const [cases, setCases] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    court_name: "",
    lawyer_assigned: "",
    verdict: "",
    criminal_id: ""
  });

  async function loadCases() {
    try {
      const res = await api.get("/cases");
      setCases(res.data.data || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load cases."));
    } finally {
      setLoading(false);
    }
  }

  async function loadOfficers() {
    try {
      const res = await api.get("/officers");
      setOfficers(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadCases();
    if (isAdmin) loadOfficers();
  }, []);

  const filteredCases = cases.filter((c) =>
    (c.court_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.criminal_name || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreateCase(e) {
    e.preventDefault();
    try {
      const res = await api.post("/cases", form);
      setCases((prev) => [...prev, res.data.data]);
      setForm({
        court_name: "",
        lawyer_assigned: "",
        verdict: "",
        criminal_id: ""
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to create case."));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this case?")) return;
    try {
      await api.delete(`/cases/${id}`);
      await loadCases();
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  }

  async function updateSentence(caseId) {
    const sentence = window.prompt("Enter sentence (e.g. 5 years imprisonment):");
    if (!sentence) return;
    try {
      await api.put(`/cases/${caseId}/sentence`, { sentence });
      await loadCases();
    } catch (err) {
      console.error(err);
      alert("Failed to update sentence.");
    }
  }

  async function assignOfficer(caseId, officerId) {
    try {
      await api.put(`/cases/${caseId}/assign`, { officer_id: officerId });
      await loadCases();
    } catch (err) {
      console.error(err);
      alert("Failed to assign officer.");
    }
  }

  const columns = [
    {
      key: "case_id",
      label: "Case ID",
      render: (row) => (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "var(--ink)"
          }}
        >
          CASE-{row.case_id}
        </span>
      )
    },
    {
      key: "court_name",
      label: "Court / Lawyer",
      render: (row) => (
        <div>
          <p
            style={{
              fontWeight: 600,
              color: "var(--ink)",
              fontSize: "0.88rem",
              lineHeight: 1.25
            }}
          >
            {row.court_name}
          </p>
          <p
            style={{
              fontSize: "0.74rem",
              color: "var(--ink-faint)",
              marginTop: "0.22rem"
            }}
          >
            {row.lawyer_assigned || "No lawyer assigned"}
          </p>
        </div>
      )
    },
    {
      key: "verdict",
      label: "Status",
      render: (row) => (
        <span className={`status-pill ${verdictClass(row.verdict)}`}>
          {row.verdict || "Unknown"}
        </span>
      )
    },
    {
      key: "sentence",
      label: "Sentence",
      render: (row) => (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.74rem",
            color: row.sentence ? "var(--ink)" : "#8695a4"
          }}
        >
          {row.sentence || "—"}
        </span>
      )
    },
    {
      key: "criminal_name",
      label: "Criminal",
      render: (row) => (
        <div>
          <p
            style={{
              fontWeight: 500,
              color: "var(--ink)",
              fontSize: "0.88rem"
            }}
          >
            {row.criminal_name || "Unknown"}
          </p>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              color: "#7f8f9f",
              marginTop: "0.18rem"
            }}
          >
            ID: {row.criminal_id}
          </p>
        </div>
      )
    },
    {
      key: "assigned_officer",
      label: "Officer",
      render: (row) => (
        <span
          className={`officer-badge${row.assigned_officer ? "" : " officer-badge--empty"}`}
        >
          {row.assigned_officer || "Unassigned"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        isAdmin ? (
          <div className="case-actions">
            <button
              className="btn-ghost btn-sm"
              onClick={() => updateSentence(row.case_id)}
              title="Update sentence"
            >
              Sentence
            </button>

            <select
              className="assign-select"
              value={row.officer_id || ""}
              onChange={(e) => {
                if (e.target.value) assignOfficer(row.case_id, e.target.value);
              }}
            >
              <option value="">Assign officer…</option>
              {officers.map((o) => (
                <option key={o.officer_id} value={o.officer_id}>
                  {o.name}
                </option>
              ))}
            </select>

            <button
              className="btn-danger btn-sm"
              onClick={() => handleDelete(row.case_id)}
              title="Delete case"
            >
              Delete
            </button>
          </div>
        ) : null
    }
  ];

  return (
    <div className="space-y-5">
      <section className="panel px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="soft-label">Case Management</span>
            <h1
              style={{
                marginTop: "0.35rem",
                fontSize: "1.7rem",
                fontWeight: 650,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                color: "var(--ink)"
              }}
            >
              Case Registry
            </h1>
            <p
              style={{
                marginTop: "0.5rem",
                maxWidth: "48rem",
                fontSize: "0.86rem",
                lineHeight: 1.65,
                color: "var(--ink-faint)"
              }}
            >
              Search, review, and maintain case records, sentencing details, and
              officer assignments from a single workspace.
            </p>
          </div>

          <div className="cases-search-wrap">
            <SearchIcon />
            <input
              className="input cases-search-input"
              placeholder="Search by court name or criminal…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {isAdmin && (
        <div className="panel cases-form-panel">
          <span className="cases-form-title">New Case Record</span>

          <form onSubmit={handleCreateCase}>
            <div className="cases-form-grid">
              <input
                className="input"
                placeholder="Court name"
                value={form.court_name}
                onChange={(e) => setForm({ ...form, court_name: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Lawyer assigned"
                value={form.lawyer_assigned}
                onChange={(e) =>
                  setForm({ ...form, lawyer_assigned: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="Verdict (e.g. Guilty)"
                value={form.verdict}
                onChange={(e) => setForm({ ...form, verdict: e.target.value })}
              />
              <input
                className="input"
                placeholder="Criminal ID"
                value={form.criminal_id}
                onChange={(e) => setForm({ ...form, criminal_id: e.target.value })}
                required
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ whiteSpace: "nowrap" }}
              >
                Add case
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        title="Case Records"
        description="Track legal status, case assignment, and sentencing details."
        columns={columns}
        data={filteredCases}
        loading={loading}
        error={error}
        emptyMessage="No case records found."
      />
    </div>
  );
}
