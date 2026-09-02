import { useNavigate } from 'react-router-dom'
import { StatusBadge, PriorityBadge } from './Badge'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TicketCard({ tickets, onEdit, onDelete }) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {tickets.map((t) => (
        <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">#{t.id}</p>
              <button onClick={() => navigate(`/tickets/${t.id}`)} className="text-left font-semibold text-slate-800 hover:underline">
                {t.subject}
              </button>
              <p className="text-sm text-slate-500">{t.customerName}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <PriorityBadge priority={t.priority} />
              <StatusBadge status={t.status} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Agent: {t.assignedAgent}</span>
            <span>{formatDate(t.createdDate)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate(`/tickets/${t.id}`)}
              className="flex-1 rounded-md border border-slate-300 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              View
            </button>
            <button
              onClick={() => onEdit(t)}
              className="flex-1 rounded-md border border-brand-200 bg-brand-50 py-1.5 text-xs text-brand-700 hover:bg-brand-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(t)}
              className="flex-1 rounded-md border border-red-200 bg-red-50 py-1.5 text-xs text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
