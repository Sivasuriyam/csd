import { useNavigate } from 'react-router-dom'
import { StatusBadge, PriorityBadge } from './Badge'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TicketTable({ tickets, onEdit, onDelete }) {
  const navigate = useNavigate()

  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Ticket ID</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Agent</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-700">#{t.id}</td>
              <td className="px-4 py-3">
                <button onClick={() => navigate(`/tickets/${t.id}`)} className="text-left hover:underline">
                  {t.customerName}
                </button>
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{t.subject}</td>
              <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3 text-slate-500">{formatDate(t.createdDate)}</td>
              <td className="px-4 py-3 text-slate-600">{t.assignedAgent}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(t)}
                    className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs text-brand-700 hover:bg-brand-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
