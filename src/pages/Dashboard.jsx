import { useState } from 'react'
import { useTickets } from '../context/TicketsContext'
import SummaryCards from '../components/SummaryCards'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import TicketTable from '../components/TicketTable'
import TicketCard from '../components/TicketCard'
import Pagination from '../components/Pagination'
import TicketForm from '../components/TicketForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { Loader, ErrorState, EmptyState } from '../components/StatusStates'

export default function Dashboard() {
  const {
    loading,
    error,
    reload,
    pageTickets,
    filteredTickets,
    summary,
    page,
    totalPages,
    setPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    clearFilters,
    createTicket,
    updateTicket,
    deleteTicket
  } = useTickets()

  const [formMode, setFormMode] = useState(null) // 'create' | 'edit' | null
  const [activeTicket, setActiveTicket] = useState(null)
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleCreateSubmit(form) {
    await createTicket(form)
    setFormMode(null)
    showToast('Ticket created successfully.')
  }

  async function handleEditSubmit(form) {
    await updateTicket(activeTicket.id, form)
    setFormMode(null)
    setActiveTicket(null)
    showToast('Ticket updated successfully.')
  }

  async function handleDeleteConfirm() {
    setDeleting(true)
    try {
      await deleteTicket(ticketToDelete.id)
      showToast('Ticket deleted.')
    } finally {
      setDeleting(false)
      setTicketToDelete(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800">Customer Support Dashboard</h1>
        <p className="text-sm text-slate-500">Track, triage, and resolve customer support tickets.</p>
      </div>

      <div className="mb-6">
        <SummaryCards summary={summary} />
      </div>

      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <FilterBar
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onClear={clearFilters}
          />
        </div>
        <button
          onClick={() => setFormMode('create')}
          className="whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Create Ticket
        </button>
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && filteredTickets.length === 0 && <EmptyState />}

      {!loading && !error && filteredTickets.length > 0 && (
        <>
          <TicketTable
            tickets={pageTickets}
            onEdit={(t) => {
              setActiveTicket(t)
              setFormMode('edit')
            }}
            onDelete={(t) => setTicketToDelete(t)}
          />
          <TicketCard
            tickets={pageTickets}
            onEdit={(t) => {
              setActiveTicket(t)
              setFormMode('edit')
            }}
            onDelete={(t) => setTicketToDelete(t)}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {formMode === 'create' && (
        <TicketForm mode="create" onSubmit={handleCreateSubmit} onCancel={() => setFormMode(null)} />
      )}

      {formMode === 'edit' && activeTicket && (
        <TicketForm
          mode="edit"
          initialTicket={activeTicket}
          onSubmit={handleEditSubmit}
          onCancel={() => {
            setFormMode(null)
            setActiveTicket(null)
          }}
        />
      )}

      <ConfirmDialog
        open={!!ticketToDelete}
        title="Delete this ticket?"
        message={
          ticketToDelete
            ? `This will permanently delete ticket #${ticketToDelete.id} ("${ticketToDelete.subject}"). This action cannot be undone.`
            : ''
        }
        busy={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTicketToDelete(null)}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
