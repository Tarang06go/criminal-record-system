export default function DataTable({
  title,
  description,
  columns = [],
  data = [],
  loading = false,
  error = "",
  emptyMessage = "No records found.",
}) {
  return (
    <section className="table-section">
      {/* Header */}
      <div className="table-head-row">
        <div>
          <p className="table-section-title">{title}</p>
          {description && (
            <p className="table-section-sub">{description}</p>
          )}
        </div>
        <span className="table-count-badge">
          {loading ? "—" : data.length}{" "}
          {data.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ textAlign: col.align ?? "left" }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="table-empty">
                    <p className="table-empty-title">Loading records…</p>
                    <p className="table-empty-sub">
                      Fetching data from the secure backend.
                    </p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="table-empty">
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--red)" }}>
                      {error}
                    </p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="table-empty">
                    <p className="table-empty-title">{emptyMessage}</p>
                    <p className="table-empty-sub">No matching records in the database.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={
                    row.case_id ??
                    row.officer_id ??
                    row.criminal_id ??
                    row.id ??
                    idx
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align ?? "left" }}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
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
