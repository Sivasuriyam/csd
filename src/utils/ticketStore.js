// ---------------------------------------------------------------------------
// Since the backing API (DummyJSON /posts) has no ticket-domain fields and
// does not truly persist writes, this module layers deterministic,
// localStorage-backed ticket metadata + local CRUD overrides on top of the
// raw API data. Every ticket still originates from (or is sent to) the real
// API — this only fills the gap DummyJSON leaves for a ticketing domain.
// ---------------------------------------------------------------------------

const KEYS = {
  META: 'csd_ticket_meta_v1',
  OVERRIDES: 'csd_ticket_overrides_v1',
  DELETED: 'csd_ticket_deleted_v1',
  CREATED: 'csd_ticket_created_v1'
}

const STATUSES = ['Open', 'In Progress', 'Resolved']
const PRIORITIES = ['Low', 'Medium', 'High']
const AGENTS = [
  'Alex Johnson',
  'Priya Singh',
  'Michael Chen',
  'Sara Lee',
  'David Kim',
  'Fatima Noor',
  'Liam O\'Brien'
]

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode, quota, etc) — fail silently,
    // the app still works for the current session via in-memory state.
  }
}

function hashSeed(value) {
  const str = String(value)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

// ---- generated meta (priority/status/agent/dates/customer) --------------

export function getMetaCache() {
  return readJSON(KEYS.META, {})
}

export function getOrCreateMeta(postId, userId, usersById) {
  const cache = getMetaCache()
  if (cache[postId]) return cache[postId]

  const seed = hashSeed(postId)
  const priority = PRIORITIES[seed % PRIORITIES.length]
  const status = STATUSES[(seed >> 2) % STATUSES.length]
  const agent = AGENTS[(seed >> 4) % AGENTS.length]

  const daysAgo = (seed % 45) + 1
  const created = new Date()
  created.setDate(created.getDate() - daysAgo)
  const updated = new Date(created)
  updated.setHours(updated.getHours() + ((seed >> 6) % 72))

  const user = usersById?.[userId]
  const customerName = user ? `${user.firstName} ${user.lastName}` : `Customer #${userId ?? postId}`
  const customerEmail = user ? user.email : `customer${userId ?? postId}@example.com`

  const meta = {
    priority,
    status,
    assignedAgent: agent,
    createdDate: created.toISOString(),
    updatedDate: updated.toISOString(),
    customerName,
    customerEmail
  }

  cache[postId] = meta
  writeJSON(KEYS.META, cache)
  return meta
}

// ---- overrides applied on top of API + generated meta after edits -------

export function getOverrides() {
  return readJSON(KEYS.OVERRIDES, {})
}

export function saveOverride(id, patch) {
  const overrides = getOverrides()
  overrides[id] = { ...(overrides[id] || {}), ...patch, updatedDate: new Date().toISOString() }
  writeJSON(KEYS.OVERRIDES, overrides)
  return overrides[id]
}

// ---- soft-deleted ids (hidden from the merged list) ----------------------

export function getDeletedIds() {
  return readJSON(KEYS.DELETED, [])
}

export function markDeleted(id) {
  const deleted = getDeletedIds()
  if (!deleted.includes(id)) {
    deleted.push(id)
    writeJSON(KEYS.DELETED, deleted)
  }
}

// ---- locally-created tickets (fully client-owned records) ---------------

export function getCreatedTickets() {
  return readJSON(KEYS.CREATED, [])
}

export function addCreatedTicket(ticket) {
  const created = getCreatedTickets()
  created.unshift(ticket)
  writeJSON(KEYS.CREATED, created)
  return ticket
}

export function removeCreatedTicket(id) {
  const created = getCreatedTickets().filter((t) => t.id !== id)
  writeJSON(KEYS.CREATED, created)
}

export function updateCreatedTicket(id, patch) {
  const created = getCreatedTickets().map((t) =>
    t.id === id ? { ...t, ...patch, updatedDate: new Date().toISOString() } : t
  )
  writeJSON(KEYS.CREATED, created)
}

export { STATUSES, PRIORITIES, AGENTS }
