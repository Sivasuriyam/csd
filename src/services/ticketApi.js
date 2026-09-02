import axios from 'axios'

// ---------------------------------------------------------------------------
// DummyJSON is used as the backing REST API for this dashboard.
// It does not have a native "support ticket" resource, so we use the
// `/posts` resource as the underlying record (it fully supports
// GET / POST / PUT / PATCH / DELETE with a paginated list + search),
// and `/users` to source real customer/agent identities.
//
// All ticket-domain fields that don't exist on `/posts` (status, priority,
// assignedAgent, createdDate, updatedDate) are generated deterministically
// per-record and persisted in localStorage (see utils/ticketStore.js) so a
// realistic, stable ticket dataset is layered on top of real API calls.
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// GET a single page of posts (server-side pagination via limit/skip)
export function getPostsPage(limit = 10, skip = 0) {
  return api.get('/posts', { params: { limit, skip } })
}

// GET every post in one call (limit=0 means "no limit" on DummyJSON).
// Used when search/filter is active, since DummyJSON cannot combine
// full-text search with our extra client-side ticket fields server-side.
export function getAllPosts() {
  return api.get('/posts', { params: { limit: 0 } })
}

// GET /posts/search?q=  (native DummyJSON full text search endpoint)
export function searchPostsApi(query) {
  return api.get('/posts/search', { params: { q: query } })
}

// GET all users, used to source customer names/emails
export function getUsers() {
  return api.get('/users', { params: { limit: 0 } })
}

// POST /posts/add — create a new ticket record
export function createPostApi(payload) {
  return api.post('/posts/add', payload)
}

// PUT /posts/:id — full update
export function updatePostApi(id, payload) {
  return api.put(`/posts/${id}`, payload)
}

// PATCH /posts/:id — partial update
export function patchPostApi(id, payload) {
  return api.patch(`/posts/${id}`, payload)
}

// DELETE /posts/:id
export function deletePostApi(id) {
  return api.delete(`/posts/${id}`)
}

export default api
