export default function StatCard({ label, value, detail, accentClass }) {
  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="soft-label">{label}</p>
          <h3 className="mt-3 text-4xl font-semibold text-ink">{value}</h3>
          <p className="mt-3 text-sm text-slate-600">{detail}</p>
        </div>

        <div
          className={`h-12 w-12 rounded-2xl ${accentClass} shadow-lg shadow-black/5`}
        />
      </div>
    </article>
  );
}