import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

export default function OfficersPage() {

  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ✅ ROLE
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  // ✅ FORM (FIXED - only once)
  const [form, setForm] = useState({
    name: "",
    officer_rank: "",
    phone: "",
    email: "",
    station: ""
  });

  // 🔹 LOAD OFFICERS
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

  useEffect(() => {
    loadOfficers();
  }, []);

  // 🔍 SEARCH FILTER
  const filteredOfficers = officers.filter((o) =>
    (o.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.station || "").toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 ADD OFFICER
  async function handleCreate(e) {
    e.preventDefault();

    try {
      const res = await api.post("/officers", form);

      // 🔥 SHOW LOGIN DETAILS
      alert(`Login created:
Username: ${res.data.login.username}
Password: ${res.data.login.password}`);

      setForm({
        name: "",
        officer_rank: "",
        phone: "",
        email: "",
        station: ""
      });

      loadOfficers();

    } catch (err) {
      alert(getApiErrorMessage(err, "Create failed"));
    }
  }

  // 🔹 DELETE
  async function handleDelete(id) {
    if (!window.confirm("Delete officer?")) return;

    try {
      await api.delete(`/officers/${id}`);
      setOfficers((prev) => prev.filter((o) => o.officer_id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed"));
    }
  }

  // 🔹 TABLE
  const columns = [
    {
      key: "officer_id",
      label: "ID",
      render: (row) => (
        <strong className="text-ink">OFF-{row.officer_id}</strong>
      )
    },
    {
      key: "name",
      label: "Name"
    },
    {
      key: "officer_rank",
      label: "Rank"
    },
    {
      key: "station",
      label: "Station"
    },
    {
      key: "phone",
      label: "Phone"
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        isAdmin && (
          <button
            onClick={() => handleDelete(row.officer_id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        )
    }
  ];

  return (
    <div className="space-y-6">

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search officers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input"
      />

      {/* ➕ FORM (ADMIN ONLY) */}
      {isAdmin && (
        <form
          onSubmit={handleCreate}
          className="panel grid gap-3 md:grid-cols-6"
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />

          <input
            placeholder="Rank"
            value={form.officer_rank}
            onChange={(e) =>
              setForm({ ...form, officer_rank: e.target.value })
            }
            className="input"
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />

          <input
            placeholder="Station"
            value={form.station}
            onChange={(e) =>
              setForm({ ...form, station: e.target.value })
            }
            className="input"
          />

          <button className="btn-primary">Add Officer</button>
        </form>
      )}

      {/* 📊 TABLE */}
      <DataTable
        title="Officers"
        description="Manage officer records and assignments."
        columns={columns}
        data={filteredOfficers}
        loading={loading}
        error={error}
        emptyMessage="No officers found."
      />
    </div>
  );
}