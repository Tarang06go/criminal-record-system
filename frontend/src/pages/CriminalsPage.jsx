import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10.5 10.5l3 3" strokeLinecap="round" />
    </svg>
  );
}

export default function CriminalsPage() {
  const [criminals, setCriminals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");

  const user    = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState({
    name: "", dob: "", gender: "", address: "", phone: "",
  });

  async function loadCriminals() {
    try {
      const res = await api.get("/criminals");
      setCriminals(res.data.data || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load criminal records."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCriminals(); }, []);

  const filtered = criminals.filter((c) =>
    (c.name    || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.address || "").toLowerCase().includes(search.toLowerCase())
  );

  function setField(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post("/criminals", form);
      setForm({ name: "", dob: "", gender: "", address: "", phone: "" });
      loadCriminals();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to add criminal record."));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this criminal record?")) return;
    try {
      await api.delete(`/criminals/${id}`);
      setCriminals((prev) => prev.filter((c) => c.criminal_id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed."));
    }
  }

  function genderPill(gender) {
    if (gender === "Male")   return "pill pill-blue";
    if (gender === "Female") return "pill pill-orange";
    return "pill pill-slate";
  }

  const columns = [
    {
      key: "criminal_id",
      label: "ID",
      align: "center",
      render: (row) => <span className="cell-id">#{row.criminal_id}</span>,
    },
    {
      key: "name",
      label: "Name",
      align: "left",
      render: (row) => <span className="cell-primary">{row.name}</span>,
    },
    {
      key: "dob",
      label: "Date of Birth",
      align: "center",
      render: (row) => (
        <span className="cell-mono" style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
          {row.dob
            ? new Date(row.dob).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "gender",
      label: "Gender",
      align: "center",
      render: (row) => (
        <span className={genderPill(row.gender)}>
          {row.gender || "—"}
        </span>
      ),
    },
    {
      key: "address",
      label: "Address",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
          {row.address || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      align: "center",
      render: (row) => (
        <span className="cell-mono" style={{ color: "var(--text-muted)" }}>
          {row.phone || "—"}
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
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(row.criminal_id)}
              >
                Delete
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap",
      }}>
        <div className="search-wrap">
          <SearchIcon />
          <input
            className="input search-input"
            placeholder="Search by name or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!loading && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.62rem",
            color: "var(--text-muted)", letterSpacing: "0.1em",
          }}>
            {filtered.length} / {criminals.length} records
          </span>
        )}
      </div>

      {/* Add criminal — admin only */}
      {isAdmin && (
        <div className="form-section">
          <span className="form-section-eyebrow">Add Criminal Record</span>
          <form onSubmit={handleCreate}>
            <div style={{
              display: "grid", gap: "0.65rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              alignItems: "end",
            }}>
              <div>
                <label className="form-field-label">Full Name</label>
                <input
                  className="input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={setField("name")}
                  required
                />
              </div>
              <div>
                <label className="form-field-label">Date of Birth</label>
                <input
                  className="input"
                  type="date"
                  value={form.dob}
                  onChange={setField("dob")}
                  required
                />
              </div>
              <div>
                <label className="form-field-label">Gender</label>
                <select className="input" value={form.gender} onChange={setField("gender")}>
                  <option value="">Select…</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="form-field-label">Address</label>
                <input
                  className="input"
                  placeholder="City / District"
                  value={form.address}
                  onChange={setField("address")}
                />
              </div>
              <div>
                <label className="form-field-label">Phone</label>
                <input
                  className="input"
                  placeholder="+91 9000000001"
                  value={form.phone}
                  onChange={setField("phone")}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                Add Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <DataTable
        title="Criminal Records"
        description="Profiles with linked offences, cases, and custody history."
        columns={columns}
        data={filtered}
        loading={loading}
        error={error}
        emptyMessage="No criminal records found."
      />

    </div>
  );
}
