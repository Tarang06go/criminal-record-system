import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

export default function OfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");

  const user    = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState({
    name: "", officer_rank: "", phone: "", email: "", station: "",
  });

  async function loadOfficers() {
    try {
      const res = await api.get("/officers");
      setOfficers(res.data.data || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load officers."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOfficers(); }, []);

  const filteredOfficers = officers.filter((o) =>
    (o.name    || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.station || "").toLowerCase().includes(search.toLowerCase())
  );

  function field(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await api.post("/officers", form);
      alert(
        `Officer created.\n\nLogin credentials:\nUsername: ${res.data.login.username}\nPassword: ${res.data.login.password}`
      );
      setForm({ name: "", officer_rank: "", phone: "", email: "", station: "" });
      loadOfficers();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to create officer."));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this officer? This will also remove their login access.")) return;
    try {
      await api.delete(`/officers/${id}`);
      setOfficers((prev) => prev.filter((o) => o.officer_id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed."));
    }
  }

  const columns = [
    {
      key: "officer_id",
      label: "ID",
      render: (row) => (
        <span style={{
          fontFamily: "var(--mono)", fontSize: "0.72rem", fontWeight: 500,
          color: "var(--ink)", background: "rgba(15,25,35,0.05)",
          border: "1px solid rgba(15,25,35,0.09)",
          padding: "0.18rem 0.5rem", borderRadius: "0.35rem",
        }}>
          #{row.officer_id}
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
      key: "officer_rank",
      label: "Rank",
      render: (row) => (
        <span style={{
          fontSize: "0.78rem", fontWeight: 500, color: "var(--ink-soft)",
          background: "rgba(15,25,35,0.04)",
          border: "1px solid rgba(15,25,35,0.08)",
          padding: "0.18rem 0.55rem", borderRadius: "0.35rem",
        }}>
          {row.officer_rank}
        </span>
      ),
    },
    {
      key: "station",
      label: "Station",
      render: (row) => (
        <span style={{ fontSize: "0.875rem", color: "var(--ink-soft)" }}>
          {row.station}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => (
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--ink-faint)" }}>
          {row.phone}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", color: "var(--ink-faint)" }}>
          {row.email}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        isAdmin ? (
          <button
            className="btn-danger btn-sm"
            onClick={() => handleDelete(row.officer_id)}
          >
            Delete
          </button>
        ) : null,
    },
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
          placeholder="Search by name or station…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Add officer form — admin only */}
      {isAdmin && (
        <div className="panel section-form">
          <span className="section-form-label">Add New Officer</span>
          <form onSubmit={handleCreate}>
            <div
              style={{
                display: "grid",
                gap: "0.65rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
                placeholder="Rank (e.g. Inspector)"
                value={form.officer_rank}
                onChange={field("officer_rank")}
                required
              />
              <input
                className="input"
                placeholder="Phone number"
                value={form.phone}
                onChange={field("phone")}
              />
              <input
                className="input"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={field("email")}
                required
              />
              <input
                className="input"
                placeholder="Station / Division"
                value={form.station}
                onChange={field("station")}
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap", alignSelf: "end" }}>
                Add Officer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <DataTable
        title="Officer Records"
        description="Active officers with station assignments and login access."
        columns={columns}
        data={filteredOfficers}
        loading={loading}
        error={error}
        emptyMessage="No officers found."
      />

    </div>
  );
}
