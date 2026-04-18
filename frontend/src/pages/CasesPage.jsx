import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

// ── Verdict pill class ────────────────────────────────────
function verdictClass(verdict) {
  if (verdict === "Guilty")                               return "verdict-guilty";
  if (verdict === "Pending" || verdict === "Under Trial") return "verdict-pending";
  return "verdict-default";
}

// ── Search icon (inline SVG — no extra dep) ───────────────
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
      <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────
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

  // ── Loaders ──────────────────────────────────────────────
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

  // ── Search filter ─────────────────────────────────────────
  const filteredCases = cases.filter((c) =>
    (c.court_name    || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.criminal_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Create case ───────────────────────────────────────────
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

  // ── Delete case ───────────────────────────────────────────
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

  // ── Update sentence ───────────────────────────────────────
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

  // ── Assign officer ────────────────────────────────────────
  async function assignOfficer(caseId, officerId) {
    try {
      await api.put(`/cases/${caseId}/assign`, { officer_id: officerId });
      await loadCases();
    } catch (err) {
      console.error(err);
      alert("Failed to assign officer.");
    }
  }

  // ── Table column definitions ──────────────────────────────
  const columns = [
    {
      key: "case_id",
      label: "Case ID",
      render: (row) => (
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", fontWeight: 500, color: "var(--ink)" }}>
          CASE-{row.case_id}
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
          <p style={{ fontSize: "0.73rem", color: "var(--muted)", marginTop: "0.2rem" }}>
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
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", color: row.sentence ? "var(--ink)" : "#8898aa" }}>
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
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", color: "#8898aa", marginTop: "0.18rem" }}>
            ID: {row.criminal_id}
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
            {/* Update sentence */}
            <button
              className="btn-ghost btn-sm"
              onClick={() => updateSentence(row.case_id)}
              title="Update sentence"
            >
              Sentence
            </button>

            {/* Assign officer — custom-styled native select */}
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

            {/* Delete */}
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

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Search ── */}
      <div className="cases-search-wrap">
        <SearchIcon />
        <input
          className="input cases-search-input"
          placeholder="Search by court name or criminal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Create case form — admin only ── */}
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
              {/* Button fills the 5th column on large screens */}
              <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap" }}>
                Add case
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Cases table ── */}
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
