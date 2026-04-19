import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

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

  function field(key) {
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

  const columns = [
    {
      key: "criminal_id",
      label: "ID",
      render: (row) => (
        <span style={{
          fontFamily: "var(--mono)", fontSize: "0.72rem", fontWeight: 500,
          color: "var(--ink)", background: "rgba(15,25,35,0.05)",
          border: "1px solid rgba(15,25,35,0.09)",
          padding: "0.18rem 0.5rem", borderRadius: "0.35rem",
        }}>
          #{row.criminal_id}
        </span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.875rem" }}>
          {row.name}
        </span>
      ),
    },
    {
      key: "age",
      label: "Age / DOB",
      render: (row) => (
        <div>
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.85rem", fontWeight: 500, color: "var(--ink)" }}>
            {row.age ?? "—"}
          </p>
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.67rem", color: "var(--muted)", marginTop: "0.1rem" }}>
            {row.dob
              ? new Date(row.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
      ),
    },
    {
      key: "gender",
      label: "Gender",
      render: (row) => (
        <span style={{
          fontSize: "0.78rem", fontWeight: 500, color: "var(--ink-soft)",
          background: "rgba(15,25,35,0.04)",
          border: "1px solid rgba(15,25,35,0.08)",
          padding: "0.18rem 0.55rem", borderRadius: "0.35rem",
        }}>
          {row.gender || "—"}
        </span>
      ),
    },
    {
      key: "address",
      label: "Address",
      render: (row) => (
        <span style={{ fontSize: "0.875rem", color: "var(--ink-soft)" }}>
          {row.address || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => (
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--ink-faint)" }}>
          {row.phone || "—"}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <button
                className="btn-danger btn-sm"
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
    <div className="space-y-5">

      {/* Search */}
      <div style={{ position: "relative", maxWidth: "26rem" }}>
        <svg
          style={{
            position: "absolute", left: "0.85rem", top: "50%",
            transform: "translateY(-50%)", color: "var(--muted)",
            width: 15, height: 15, pointerEvents: "none",
          }}
          viewBox="0 0 16 16" fill="none" aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          className="input"
          style={{ paddingLeft: "2.4rem" }}
          placeholder="Search by name or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Add criminal — admin only */}
      {isAdmin && (
        <div className="panel section-form">
          <span className="section-form-label">Add Criminal Record</span>
          <form onSubmit={handleCreate}>
            <div
              style={{
                display: "grid",
                gap: "0.65rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              }}
            >
              <input
                className="input"
                placeholder="Full name"
                value={form.name}
                onChange={field("name")}
                required
              />
              <input
                className="input"
                type="date"
                placeholder="Date of birth"
                value={form.dob}
                onChange={field("dob")}
                required
              />
              <select
                className="input"
                value={form.gender}
                onChange={field("gender")}
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                className="input"
                placeholder="Address"
                value={form.address}
                onChange={field("address")}
              />
              <input
                className="input"
                placeholder="Phone number"
                value={form.phone}
                onChange={field("phone")}
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap", alignSelf: "end" }}>
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
