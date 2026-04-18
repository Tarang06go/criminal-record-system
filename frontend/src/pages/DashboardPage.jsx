import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}
      <header className="bg-white border-b px-6 h-16 flex items-center justify-between">
        <h1 className="font-semibold text-lg">CRMS Dashboard</h1>

        <nav className="flex gap-6 text-sm font-medium">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/criminals">Criminals</Link>
          <Link to="/cases">Cases</Link>
          <Link to="/officers">Officers</Link>
        </nav>
      </header>

      {/* CONTENT */}
      <div className="p-6 space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Cases", "Officers", "Criminals", "Active"].map((item) => (
            <div key={item} className="card p-5">
              <p className="text-sm text-slate-500">{item}</p>
              <p className="text-2xl font-semibold mt-1">123</p>
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Recent Cases</h2>

          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left py-2">Case</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t">
                <td className="py-3">Robbery</td>
                <td>Active</td>
                <td>Today</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}