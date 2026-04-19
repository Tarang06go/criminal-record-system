import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

function verdictClass(verdict) {
  if (verdict === "Guilty")                               return "verdict-guilty";
  if (verdict === "Pending" || verdict === "Under Trial") return "verdict-pending";
  return "verdict-default";
}

function SearchIcon() {
  return (
    <svg
      className="cases-search-icon"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function CasesPage() {
  const user    = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const [cases,    setCases]    = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");

  const [form, setForm] = useState({
    court_name: "", lawyer_assigned: "", verdict: "", criminal_id: "",
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
    (c.court_name    || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.criminal_name || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreateCase(e) {
    e.preventDefault();
    try {
      const res = await api.post("/cases", form);
      setCases((prev) => [...prev, res.data.data]);
      setForm({ court_name: "", lawyer_assigned: "", verdict: "", criminal_id: "" });
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
        <span style={{
          fontFamily: "var(--mono)", fontSize: "0.73rem",
          fontWeight: 500, color: "var(--ink)",
          background: "rgba(15,25,35,0.05)",
          border: "1px solid rgba(15,25,35,0.09)",
          padding: "0.18rem 0.5rem", borderRadius: "0.35rem",
        }}>
          #{row.case_id}
        </span>
      ),
    },
    {
      key: "court_name",
      label: "Court / Lawyer",
      render: (row) => (
        <div>
          <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.875rem" }}>
            {row.court_name}
          </p>
          <p style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: "0.18rem" }}>
            {row.lawyer_assigned || "No lawyer assigned"}
          </p>
        </div>
      ),
    },
    {
      key: "verdict",
      label: "Status",
      render: (row) => (
        <span className={`status-pill ${verdictClass(row.verdict)}`}>
          {row.verdict || "Unknown"}
        </span>
      ),
    },
    {
      key: "sentence",
      label: "Sentence",
      render: (row) => (
        <span style={{
          fontFamily: "var(--mono)", fontSize: "0.73rem",
          color: row.sentence ? "var(--ink)" : "var(--muted)",
        }}>
          {row.sentence || "—"}
        </span>
      ),
    },
    {
      key: "criminal_name",
      label: "Criminal",
      render: (row) => (
        <div>
          <p style={{ fontWeight: 500, color: "var(--ink)", fontSize: "0.875rem" }}>
            {row.criminal_name || "Unknown"}
          </p>
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.67rem", color: "var(--muted)", marginTop: "0.15rem" }}>
            ID {row.criminal_id}
          </p>
        </div>
      ),
    },
    {
      key: "assigned_officer",
      label: "Officer",
      render: (row) => (
        <span className={`officer-badge${row.assigned_officer ? "" : " officer-badge--empty"}`}>
          {row.assigned_officer || "Unassigned"}
        </span>
      ),
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
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">

      {/* Search + header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="cases-search-wrap">
          <SearchIcon />
          <input
            className="input cases-search-input"
            placeholder="Search by court or criminal name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!loading && (
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            {filteredCases.length} of {cases.length} cases
          </p>
        )}
      </div>

      {/* Create case — admin only */}
      {isAdmin && (
        <div className="panel section-form">
          <span className="section-form-label">New Case Record</span>
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
                onChange={(e) => setForm({ ...form, lawyer_assigned: e.target.value })}
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
              <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap" }}>
                Add Case
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
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
