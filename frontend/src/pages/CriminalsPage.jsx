import { useEffect, useState } from "react";

import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

export default function CriminalsPage() {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(""); // ✅ NEW

  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    address: "",
    phone: ""
  });

  async function loadCriminals() {
    try {
      const res = await api.get("/criminals");
      setCriminals(res.data.data || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load criminals."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCriminals();
  }, []);

  // ✅ SEARCH FILTER
  const filteredCriminals = criminals.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  async function handleCreate(e) {
    e.preventDefault();

    try {
      const res = await api.post("/criminals", form);

      setCriminals((prev) => [...prev, res.data.data]);

      setForm({
        name: "",
        dob: "",
        gender: "",
        address: "",
        phone: ""
      });

    } catch (err) {
      alert(getApiErrorMessage(err, "Create failed"));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete criminal?")) return;

    try {
      await api.delete(`/criminals/${id}`);
      setCriminals((prev) =>
        prev.filter((c) => c.criminal_id !== id)
      );
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed"));
    }
  }

  const columns = [
    {
      key: "criminal_id",
      label: "ID",
      render: (row) => <strong>#{row.criminal_id}</strong>
    },
    {
      key: "name",
      label: "Name"
    },
    {
      key: "gender",
      label: "Gender"
    },
    {
      key: "age",
      label: "Age"
    },
    {
      key: "phone",
      label: "Phone"
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => handleDelete(row.criminal_id)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">

      {/* 🔍 SEARCH BAR */}
      <input
        placeholder="Search criminals..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input"
      />

      {/* CREATE FORM */}
      <form
        onSubmit={handleCreate}
        className="panel grid gap-3 md:grid-cols-6"
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="input"
        />

        <input
          type="date"
          value={form.dob}
          onChange={(e) =>
            setForm({ ...form, dob: e.target.value })
          }
          className="input"
        />

        <input
          placeholder="Gender"
          value={form.gender}
          onChange={(e) =>
            setForm({ ...form, gender: e.target.value })
          }
          className="input"
        />

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
          className="input"
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          className="input"
        />

        <button className="btn-primary">Add</button>
      </form>

      {/* TABLE */}
      <DataTable
        title="Criminal Records"
        description="Manage criminal profiles and personal information."
        columns={columns}
        data={filteredCriminals}   // ✅ IMPORTANT
        loading={loading}
        error={error}
        emptyMessage="No criminals found."
      />
    </div>
  );
}