import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTickets } from '../context/TicketsContext'
import { StatusBadge, PriorityBadge } from '../components/Badge'
import TicketForm from '../components/TicketForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { Loader, EmptyState } from '../components/StatusStates'

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function TicketDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTicketById, updateTicket, deleteTicket, loading } = useTickets()
  const ticket = getTicketById(id)

  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10"><Loader /></div>

  if (!ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState title="Ticket not found" subtitle="It may have been deleted or the link is incorrect." />
        <button onClick={() => navigate('/')} className="mt-4 text-sm text-brand-600 hover:underline">
          ← Back to dashboard
        </button>
      </div>
    )
  }

  async function handleEditSubmit(form) {
    await updateTicket(ticket.id, form)
    setEditing(false)
  }

  async function handleDeleteConfirm() {
    setDeleting(true)
    try {
      await deleteTicket(ticket.id)
      navigate('/')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <button onClick={() => navigate('/')} className="mb-4 text-sm text-brand-600 hover:underline">
        ← Back to dashboard
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-400">Ticket #{ticket.id}</p>
            <h1 className="mt-1 text-xl font-bold text-slate-800">{ticket.subject}</h1>
          </div>
          <div className="flex gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Customer Name" value={ticket.customerName} />
          <Detail label="Customer Email" value={ticket.customerEmail} />
          <Detail label="Assigned Agent" value={ticket.assignedAgent} />
          <Detail label="Priority" value={ticket.priority} />
          <Detail label="Status" value={ticket.status} />
          <Detail label="Created" value={formatDateTime(ticket.createdDate)} />
          <Detail label="Last Updated" value={formatDateTime(ticket.updatedDate)} />
        </div>

        <div className="mt-6">
          <p className="mb-1 text-sm font-medium text-slate-500">Description</p>
          <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {ticket.description}
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Edit Ticket
          </button>
          <button
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Delete Ticket
          </button>
        </div>
      </div>

      {editing && (
        <TicketForm mode="edit" initialTicket={ticket} onSubmit={handleEditSubmit} onCancel={() => setEditing(false)} />
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this ticket?"
        message={`This will permanently delete ticket #${ticket.id} ("${ticket.subject}"). This action cannot be undone.`}
        busy={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-700">{value}</p>
    </div>
  )
}
