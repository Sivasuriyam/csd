const STATUS_STYLES = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Resolved: 'bg-emerald-100 text-emerald-700'
}

const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-orange-100 text-orange-700',
  High: 'bg-red-100 text-red-700'
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-600'}`}>
      {priority}
    </span>
  )
}
