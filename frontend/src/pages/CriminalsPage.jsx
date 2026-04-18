import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api from "../services/api";

export default function CriminalsPage() {

  const [criminals, setCriminals] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/criminals").then(res => setCriminals(res.data.data));
  }, []);

  const filtered = criminals.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-semibold">Criminals</h1>

      <input
        className="input max-w-sm"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        title="Criminal Records"
        data={filtered}
        columns={[
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" }
        ]}
      />

    </div>
  );
}