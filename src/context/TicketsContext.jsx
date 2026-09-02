import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  getAllPosts,
  getUsers,
  createPostApi,
  updatePostApi,
  deletePostApi
} from '../services/ticketApi'
import {
  getOrCreateMeta,
  getOverrides,
  saveOverride,
  getDeletedIds,
  markDeleted,
  getCreatedTickets,
  addCreatedTicket,
  removeCreatedTicket,
  updateCreatedTicket
} from '../utils/ticketStore'

const TicketsContext = createContext(null)

const PAGE_SIZE = 8

function mapPostToTicket(post, usersById) {
  const meta = getOrCreateMeta(post.id, post.userId, usersById)
  const overrides = getOverrides()[post.id] || {}
  return {
    id: post.id,
    source: 'api',
    subject: overrides.subject ?? post.title,
    description: overrides.description ?? post.body,
    customerName: meta.customerName,
    customerEmail: meta.customerEmail,
    priority: overrides.priority ?? meta.priority,
    status: overrides.status ?? meta.status,
    assignedAgent: overrides.assignedAgent ?? meta.assignedAgent,
    createdDate: meta.createdDate,
    updatedDate: overrides.updatedDate ?? meta.updatedDate
  }
}

export function TicketsProvider({ children }) {
  const [rawPosts, setRawPosts] = useState([])
  const [usersById, setUsersById] = useState({})
  const [createdVersion, setCreatedVersion] = useState(0) // bump to re-read localStorage created list
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [postsRes, usersRes] = await Promise.all([getAllPosts(), getUsers()])
      const byId = {}
      for (const u of usersRes.data.users || []) byId[u.id] = u
      setUsersById(byId)
      setRawPosts(postsRes.data.posts || [])
    } catch (err) {
      setError(
        err?.code === 'ERR_NETWORK'
          ? 'Network error: unable to reach the support ticket API. Check your connection and try again.'
          : err?.response
          ? `API error (${err.response.status}): ${err.response.statusText || 'Something went wrong'}`
          : 'Something went wrong while loading tickets.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const deletedIds = getDeletedIds()

  const allTickets = useMemo(() => {
    const fromApi = rawPosts
      .filter((p) => !deletedIds.includes(p.id))
      .map((p) => mapPostToTicket(p, usersById))

    const created = getCreatedTickets().filter((t) => !deletedIds.includes(t.id))

    return [...created, ...fromApi]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPosts, usersById, createdVersion])

  const filteredTickets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return allTickets.filter((t) => {
      const matchesSearch =
        !term ||
        t.customerName.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term) ||
        String(t.id).toLowerCase().includes(term)
      const matchesStatus = !statusFilter || t.status === statusFilter
      const matchesPriority = !priorityFilter || t.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [allTickets, searchTerm, statusFilter, priorityFilter])

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageTickets = useMemo(
    () => filteredTickets.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredTickets, safePage]
  )

  const summary = useMemo(() => {
    return {
      total: allTickets.length,
      open: allTickets.filter((t) => t.status === 'Open').length,
      inProgress: allTickets.filter((t) => t.status === 'In Progress').length,
      resolved: allTickets.filter((t) => t.status === 'Resolved').length,
      highPriority: allTickets.filter((t) => t.priority === 'High').length
    }
  }, [allTickets])

  const getTicketById = useCallback((id) => allTickets.find((t) => String(t.id) === String(id)), [allTickets])

  const createTicket = useCallback(async (form) => {
    // Real POST request against the API, per requirement (#5).
    const res = await createPostApi({
      title: form.subject,
      body: form.description,
      userId: 1
    })
    const newId = res?.data?.id ?? `local-${Date.now()}`
    const now = new Date().toISOString()
    const ticket = {
      id: newId,
      source: 'local',
      subject: form.subject,
      description: form.description,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      priority: form.priority,
      status: 'Open',
      assignedAgent: form.assignedAgent,
      createdDate: now,
      updatedDate: now
    }
    addCreatedTicket(ticket)
    setCreatedVersion((v) => v + 1)
    return ticket
  }, [])

  const updateTicket = useCallback(async (id, patch) => {
    const ticket = getTicketById(id)
    // Real PUT request against the API, per requirement (#6).
    try {
      await updatePostApi(id, {
        title: patch.subject ?? ticket?.subject,
        body: patch.description ?? ticket?.description
      })
    } catch {
      // DummyJSON only "persists" ids that exist server-side; ignore failures
      // for locally-created tickets and keep the local update authoritative.
    }

    if (ticket?.source === 'local') {
      updateCreatedTicket(id, patch)
    } else {
      saveOverride(id, patch)
    }
    setCreatedVersion((v) => v + 1)
  }, [getTicketById])

  const deleteTicket = useCallback(async (id) => {
    const ticket = getTicketById(id)
    try {
      await deletePostApi(id)
    } catch {
      // ignore — see note above regarding locally-created / mock ids
    }
    if (ticket?.source === 'local') {
      removeCreatedTicket(id)
    } else {
      markDeleted(id)
    }
    setCreatedVersion((v) => v + 1)
  }, [getTicketById])

  const value = {
    loading,
    error,
    reload: loadData,
    allTickets,
    pageTickets,
    filteredTickets,
    summary,
    page: safePage,
    totalPages,
    setPage,
    pageSize: PAGE_SIZE,
    searchTerm,
    setSearchTerm: (v) => {
      setSearchTerm(v)
      setPage(1)
    },
    statusFilter,
    setStatusFilter: (v) => {
      setStatusFilter(v)
      setPage(1)
    },
    priorityFilter,
    setPriorityFilter: (v) => {
      setPriorityFilter(v)
      setPage(1)
    },
    clearFilters: () => {
      setSearchTerm('')
      setStatusFilter('')
      setPriorityFilter('')
      setPage(1)
    },
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket
  }

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}

export function useTickets() {
  const ctx = useContext(TicketsContext)
  if (!ctx) throw new Error('useTickets must be used within a TicketsProvider')
  return ctx
}
