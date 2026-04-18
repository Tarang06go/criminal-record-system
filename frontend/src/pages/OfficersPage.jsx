import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

export default function OfficersPage() {

  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState({
    name: "",
    officer_rank: "",
    phone: "",
    email: "",
    station: ""
  });

  async function loadOfficers() {
    try {
      const res = await api.get("/officers");
      setOfficers(res.data.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOfficers();
  }, []);

  const filteredOfficers = officers.filter((o) =>
    (o.name || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await api.post("/officers", form);
      alert(`Username: ${res.data.login.username}\nPassword: ${res.data.login.password}`);
      loadOfficers();
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete officer?")) return;
    await api.delete(`/officers/${id}`);
    loadOfficers();
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "officer_rank", label: "Rank" },
    { key: "station", label: "Station" },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        isAdmin && (
          <button
            onClick={() => handleDelete(row.officer_id)}
            className="text-red-600"
          >
            Delete
          </button>
        )
    }
  ];

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-semibold">Officers</h1>

      <input
        placeholder="Search officers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input max-w-sm"
      />

      {isAdmin && (
        <form onSubmit={handleCreate} className="card p-4 grid gap-3 md:grid-cols-5">
          <input className="input" placeholder="Name" onChange={(e)=>setForm({...form,name:e.target.value})}/>
          <input className="input" placeholder="Rank" onChange={(e)=>setForm({...form,officer_rank:e.target.value})}/>
          <input className="input" placeholder="Phone" onChange={(e)=>setForm({...form,phone:e.target.value})}/>
          <input className="input" placeholder="Email" onChange={(e)=>setForm({...form,email:e.target.value})}/>
          <input className="input" placeholder="Station" onChange={(e)=>setForm({...form,station:e.target.value})}/>
          <button className="btn-primary col-span-full">Add Officer</button>
        </form>
      )}

      <DataTable
        title="Officers"
        columns={columns}
        data={filteredOfficers}
        loading={loading}
        error={error}
      />
    </div>
  );
}