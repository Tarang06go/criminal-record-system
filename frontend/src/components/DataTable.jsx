export default function DataTable({
  title,
  description,
  columns = [],
  data = [],
  loading,
  error,
  emptyMessage = "No records found.",
}) {
  return (
    <section className="table-shell">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "rgba(15,25,35,0.07)", background: "rgba(248,250,252,0.7)" }}>
        <div>
          <p className="soft-label">Live Records</p>
          <h3 className="mt-1.5 text-xl font-semibold" style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}>
            {title}
          </h3>
          {description && (
            <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--ink-faint)", lineHeight: 1.55 }}>
              {description}
            </p>
          )}
        </div>

        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            color: "var(--muted)",
            border: "1px solid rgba(15,25,35,0.09)",
            background: "#fff",
            padding: "0.4rem 0.8rem",
            borderRadius: "0.45rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--ink)" }}>{data.length}</span>{" "}
          {data.length === 1 ? "record" : "records"}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="table-head-cell">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="table-body-cell"
                  style={{ padding: "3.5rem 1.5rem", textAlign: "center", color: "var(--muted)" }}
                >
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", letterSpacing: "0.08em" }}>
                    Loading records…
                  </span>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: "3rem 1.5rem", textAlign: "center" }}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      color: "var(--danger-fg)",
                      background: "var(--danger-bg)",
                      border: "1px solid var(--danger-border)",
                      padding: "0.55rem 1rem",
                      borderRadius: "0.5rem",
                      display: "inline-block",
                    }}
                  >
                    {error}
                  </span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: "3.5rem 1.5rem", textAlign: "center" }}
                >
                  <p className="empty-state-title">{emptyMessage}</p>
                  <p className="empty-state-sub">No data matches your current view.</p>
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
                    <td key={col.key} className="table-body-cell">
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
