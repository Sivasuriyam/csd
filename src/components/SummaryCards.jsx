const CARD_CONFIG = [
  { key: 'total', label: 'Total Tickets', accent: 'bg-slate-900 text-white' },
  { key: 'open', label: 'Open', accent: 'bg-blue-50 text-blue-700' },
  { key: 'inProgress', label: 'In Progress', accent: 'bg-amber-50 text-amber-700' },
  { key: 'resolved', label: 'Resolved', accent: 'bg-emerald-50 text-emerald-700' },
  { key: 'highPriority', label: 'High Priority', accent: 'bg-red-50 text-red-700' }
]

export default function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARD_CONFIG.map((c) => (
        <div key={c.key} className={`rounded-xl p-4 shadow-sm ${c.accent}`}>
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">{c.label}</p>
          <p className="mt-1 text-2xl font-bold">{summary[c.key]}</p>
        </div>
      ))}
    </div>
  )
}
