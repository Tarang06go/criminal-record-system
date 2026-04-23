import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function OfficersPage() {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");

  const user    = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  // ── Route guard: non-admins cannot access this page ───────
  useEffect(() => {
    if (!isAdmin) {
      navigate("/cases", { replace: true });
    }
  }, [isAdmin, navigate]);

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

  function setField(key) {
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
    if (!window.confirm("Delete this officer? Their login access will also be removed.")) return;
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
      align: "center",
      render: (row) => <span className="cell-id">#{row.officer_id}</span>,
    },
    {
      key: "name",
      label: "Name",
      align: "left",
      render: (row) => <span className="cell-primary">{row.name}</span>,
    },
    {
      key: "officer_rank",
      label: "Rank",
      align: "center",
      render: (row) => (
        <span className="pill pill-blue">{row.officer_rank}</span>
      ),
    },
    {
      key: "station",
      label: "Station",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
          {row.station}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      align: "center",
      render: (row) => (
        <span className="cell-mono" style={{ color: "var(--text-muted)" }}>
          {row.phone}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      align: "center",
      render: (row) => (
        <span className="cell-mono" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
          {row.email}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (row) =>
        isAdmin ? (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row.officer_id)}
          >
            Delete
          </button>
        ) : null,
    },
  ];

  // Don't render anything while redirecting non-admins
  if (!isAdmin) return null;

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
            placeholder="Search by name or station…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!loading && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.62rem",
            color: "var(--text-muted)", letterSpacing: "0.1em",
          }}>
            {filteredOfficers.length} / {officers.length} officers
          </span>
        )}
      </div>

      {/* Add officer form — admin only */}
      {isAdmin && (
        <div className="form-section">
          <span className="form-section-eyebrow">Add New Officer</span>
          <form onSubmit={handleCreate}>
            <div style={{
              display: "grid", gap: "0.65rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              alignItems: "end",
            }}>
              {[
                { key: "name",         label: "Full Name",  placeholder: "Inspector Ravi"       },
                { key: "officer_rank", label: "Rank",       placeholder: "Inspector"             },
                { key: "phone",        label: "Phone",      placeholder: "+91 9000000001"        },
                { key: "email",        label: "Email",      placeholder: "officer@police.in"     },
                { key: "station",      label: "Station",    placeholder: "Delhi Central"         },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="form-field-label">{label}</label>
                  <input
                    className="input"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={setField(key)}
                    type={key === "email" ? "email" : "text"}
                    required={["name", "email", "officer_rank"].includes(key)}
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                Add Officer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Officers table */}
      <DataTable
        title="Officer Records"
        description="Active officers with station assignments and system login access."
        columns={columns}
        data={filteredOfficers}
        loading={loading}
        error={error}
        emptyMessage="No officers found."
      />

    </div>
  );
}
