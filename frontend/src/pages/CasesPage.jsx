import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

// ── Verdict → pill class ─────────────────────────────────────
function verdictPill(verdict) {
  if (verdict === "Guilty")      return "pill pill-green";
  if (verdict === "Pending")     return "pill pill-yellow";
  if (verdict === "Under Trial") return "pill pill-orange";
  return "pill pill-slate";
}

// ── Inline search icon ───────────────────────────────────────
function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10.5 10.5l3 3" strokeLinecap="round" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────
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

  // ── Data loaders ──────────────────────────────────────────
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

  // ── Filtered data ─────────────────────────────────────────
  const filteredCases = cases.filter((c) =>
    (c.court_name    || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.criminal_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Actions ───────────────────────────────────────────────
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

  // ── Column definitions ────────────────────────────────────
  const columns = [
    {
      key: "case_id",
      label: "Case",
      align: "center",
      render: (row) => (
        <span className="cell-id">#{row.case_id}</span>
      ),
    },
    {
      key: "court_name",
      label: "Court / Lawyer",
      align: "left",
      render: (row) => (
        <div>
          <p className="cell-primary">{row.court_name}</p>
          <p className="cell-sub">{row.lawyer_assigned || "No lawyer assigned"}</p>
        </div>
      ),
    },
    {
      key: "verdict",
      label: "Status",
      align: "center",
      render: (row) => (
        <span className={verdictPill(row.verdict)}>
          {row.verdict || "Unknown"}
        </span>
      ),
    },
    {
      key: "sentence",
      label: "Sentence",
      align: "center",
      render: (row) => (
        <span className="cell-mono" style={{
          color: row.sentence ? "var(--text-secondary)" : "var(--text-faint)",
        }}>
          {row.sentence || "—"}
        </span>
      ),
    },
    {
      key: "criminal_name",
      label: "Criminal",
      align: "left",
      render: (row) => (
        <div>
          <p className="cell-primary">{row.criminal_name || "Unknown"}</p>
          <p className="cell-sub">ID {row.criminal_id}</p>
        </div>
      ),
    },
    {
      key: "assigned_officer",
      label: "Assigned Officer",
      align: "center",
      render: (row) => (
        <span className={`officer-chip${row.assigned_officer ? "" : " officer-chip--empty"}`}>
          {row.assigned_officer || "Unassigned"}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: "actions",
            label: "Actions",
            align: "center",
            render: (row) => (
              <div className="actions-cell" style={{ justifyContent: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
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
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(row.case_id)}
                  title="Delete case"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

      {/* Search + count row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap",
      }}>
        <div className="search-wrap">
          <SearchIcon />
          <input
            className="input search-input"
            placeholder="Search by court or criminal name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!loading && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.62rem",
            color: "var(--text-muted)", letterSpacing: "0.1em",
          }}>
            {filteredCases.length} / {cases.length} cases
          </span>
        )}
      </div>

      {/* Create case form — admin only */}
      {isAdmin && (
        <div className="form-section">
          <span className="form-section-eyebrow">Add New Case Record</span>
          <form onSubmit={handleCreateCase}>
            <div style={{
              display: "grid", gap: "0.65rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              alignItems: "end",
            }}>
              <div>
                <label className="form-field-label">Court Name</label>
                <input
                  className="input"
                  placeholder="e.g. Delhi High Court"
                  value={form.court_name}
                  onChange={(e) => setForm({ ...form, court_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-field-label">Lawyer</label>
                <input
                  className="input"
                  placeholder="Lawyer assigned"
                  value={form.lawyer_assigned}
                  onChange={(e) => setForm({ ...form, lawyer_assigned: e.target.value })}
                />
              </div>
              <div>
                <label className="form-field-label">Verdict</label>
                <select
                  className="input"
                  value={form.verdict}
                  onChange={(e) => setForm({ ...form, verdict: e.target.value })}
                >
                  <option value="">Select verdict…</option>
                  <option>Guilty</option>
                  <option>Pending</option>
                  <option>Under Trial</option>
                  <option>Acquitted</option>
                </select>
              </div>
              <div>
                <label className="form-field-label">Criminal ID</label>
                <input
                  className="input"
                  placeholder="Numeric ID"
                  value={form.criminal_id}
                  onChange={(e) => setForm({ ...form, criminal_id: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                Add Case
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cases table */}
      <DataTable
        title="Case Records"
        description="Track legal status, officer assignments, and sentencing."
        columns={columns}
        data={filteredCases}
        loading={loading}
        error={error}
        emptyMessage="No case records found."
      />

    </div>
  );
}

