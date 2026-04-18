import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api, { getApiErrorMessage } from "../services/api";

function verdictClass(verdict) {
  if (verdict === "Guilty") return "bg-emerald-100 text-emerald-700";
  if (verdict === "Pending" || verdict === "Under Trial")
    return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export default function CasesPage() {
  const user = JSON.parse(localStorage.getItem("user"));
const isAdmin = user?.role === "admin";
  const [cases, setCases] = useState([]);
  const [officers, setOfficers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    court_name: "",
    lawyer_assigned: "",
    verdict: "",
    criminal_id: ""
  });

  // 🔹 LOAD CASES
  async function loadCases() {
    try {
      const response = await api.get("/cases");
      setCases(response.data.data || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load cases."));
    } finally {
      setLoading(false);
    }
  }

  // 🔹 LOAD OFFICERS
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

  // 🔹 SEARCH FILTER
  const filteredCases = cases.filter((c) =>
    (c.court_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.criminal_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 CREATE CASE
  async function handleCreateCase(e) {
    e.preventDefault();

    try {
      const res = await api.post("/cases", form);

      setCases((prev) => [...prev, res.data.data]);

      setForm({
        court_name: "",
        lawyer_assigned: "",
        verdict: "",
        criminal_id: ""
      });

    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to create case"));
    }
  }

  // 🔹 DELETE CASE
  async function handleDelete(id) {
    if (!window.confirm("Delete this case?")) return;

    try {
      await api.delete(`/cases/${id}`);
       await loadCases();
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
}

  // 🔹 UPDATE SENTENCE
  async function updateSentence(caseId) {
    const sentence = window.prompt("Enter sentence (e.g. 5 years jail)");
    if (!sentence) return;

    try {
      await api.put(`/cases/${caseId}/sentence`, { sentence });
      alert("Sentence updated");
      await loadCases();
    } catch (err) {
    console.error(err);
      alert("Failed to update");
    }
  }

  // 🔹 ASSIGN OFFICER (DROPDOWN)
  async function assignOfficer(caseId, officerId) {
    try {
      await api.put(`/cases/${caseId}/assign`, {
        officer_id: officerId
      });

      alert("Officer assigned");
      await loadCases();

    } catch (err) {
      console.error(err);
    alert("Failed to assign");
  }
  }

  // 🔹 TABLE COLUMNS
  const columns = [
    {
      key: "case_id",
      label: "Case ID",
      render: (row) => (
        <span className="font-semibold text-ink">
          CASE-{row.case_id}
        </span>
      )
    },
    {
      key: "court_name",
      label: "Court",
      render: (row) => (
        <div>
          <p className="font-semibold text-ink">{row.court_name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {row.lawyer_assigned}
          </p>
        </div>
      )
    },
    {
      key: "verdict",
      label: "Status",
      render: (row) => (
        <span className={`status-pill ${verdictClass(row.verdict)}`}>
          {row.verdict || "Unknown"}
        </span>
      )
    },
    {
      key: "sentence",
      label: "Sentence",
      render: (row) => row.sentence || "Not assigned"
    },
    {
      key: "criminal_name",
      label: "Criminal",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-700">
            {row.criminal_name || "Unknown"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            ID: {row.criminal_id}
          </p>
        </div>
      )
    },
  {
  key: "assigned_officer",
  label: "Assigned Officer",
  render: (row) => (
    <span className="bg-green-100 px-2 py-1 rounded">
      {row.assigned_officer || "Not Assigned"}
    </span>
  )
}    ,
    {
  key: "actions",
  label: "Actions",
  render: (row) => (
    isAdmin ? (
      <div className="flex gap-2 flex-wrap">

        {/* UPDATE SENTENCE */}
        <button
          onClick={() => updateSentence(row.case_id)}
          className="text-blue-600"
        >
          Sentence
        </button>

        {/* ASSIGN OFFICER */}
        <select
          value={row.officer_id || ""}
          className="border px-2 py-1 rounded"
          onChange={(e) => {
            if (e.target.value) {
              assignOfficer(row.case_id, e.target.value);
            }
          }}
        >
          <option value="">Assign Officer</option>
          {officers.map((o) => (
            <option key={o.officer_id} value={o.officer_id}>
              {o.name}
            </option>
          ))}
        </select>

        {/* DELETE */}
        <button
          onClick={() => handleDelete(row.case_id)}
          className="text-red-600"
        >
          Delete
        </button>

      </div>
    ) : null
  )
}
    
  ];

  return (
    <div className="space-y-6">

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search cases..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input"
      />

      {/* ➕ CREATE */}
      {isAdmin && (
  <form
    onSubmit={handleCreateCase}
    className="panel grid gap-3 md:grid-cols-5"
  >

    <input
      placeholder="Court"
      value={form.court_name}
      onChange={(e) =>
        setForm({ ...form, court_name: e.target.value })
      }
      className="input"
    />

    <input
      placeholder="Lawyer"
      value={form.lawyer_assigned}
      onChange={(e) =>
        setForm({ ...form, lawyer_assigned: e.target.value })
      }
      className="input"
    />

    <input
      placeholder="Verdict"
      value={form.verdict}
      onChange={(e) =>
        setForm({ ...form, verdict: e.target.value })
      }
      className="input"
    />

    <input
      placeholder="Criminal ID"
      value={form.criminal_id}
      onChange={(e) =>
        setForm({ ...form, criminal_id: e.target.value })
      }
      className="input"
    />

    <button className="btn-primary">Add Case</button>

  </form>
)}

      {/* 📊 TABLE */}
      <DataTable
        title="Case Records"
        description="Track legal status, case assignment, and sentencing details."
        columns={columns}
        data={filteredCases}
        loading={loading}
        error={error}
        emptyMessage="No case records available."
      />
    </div>
  );
}