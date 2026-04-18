export default function DataTable({
  title,
  description,
  columns,
  data,
  loading,
  error,
  emptyMessage
}) {
  return (
    <section className="table-shell">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="soft-label">Live Records</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>

        <div className="rounded-2xl bg-slate-100/80 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-ink">{data.length}</span> records
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="table-head-cell">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/70">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  Loading records...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm font-medium text-rose-600"
                >
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id ?? row.case_id ?? row.officer_id ?? row.criminal_id ?? rowIndex}>
                  {columns.map((column) => (
                    <td key={column.key} className="table-body-cell">
                      {column.render ? column.render(row) : row[column.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

