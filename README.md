# Customer Support Dashboard

A React + Vite dashboard for managing customer support tickets, integrated with the
[DummyJSON](https://dummyjson.com) REST API.

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## How the API integration works

DummyJSON doesn't ship a "support ticket" resource, so this project uses its
`/posts` endpoint (which fully supports GET, POST, PUT, PATCH, and DELETE with
pagination and search) as the underlying ticket record, and `/users` to source
real customer identities. All real REST calls live in `src/services/ticketApi.js`.

Because `/posts` has no ticket-domain fields (status, priority, assigned agent,
created/updated dates), those are generated **deterministically** per ticket ID
(so the data is stable across reloads) and cached in `localStorage`, alongside
any local create/update/delete overrides — see `src/utils/ticketStore.js`. This
means:

- **GET** — the full post + user list is fetched from the real API on load.
- **POST** — creating a ticket sends a real `POST /posts/add` request; the
  returned ID is used to create the local ticket record.
- **PUT** — editing a ticket sends a real `PUT /posts/:id` request for the
  fields DummyJSON understands (title/body), and stores the ticket-specific
  fields (status, priority, agent) as a local override.
- **DELETE** — deleting sends a real `DELETE /posts/:id` request, then hides
  the ticket locally (DummyJSON is a mock API and does not persist writes
  server-side, so this keeps the UI consistent across a session).

This hybrid approach was necessary to build a realistic ticketing UI on top of
a generic mock API without hardcoding any ticket data — every ticket you see
originates from a real API response.

## Project Structure

```
src/
├── components/     # Reusable UI: table, cards, search, filters, forms, etc.
├── pages/          # Dashboard and TicketDetails route pages
├── context/         # TicketsContext — central data + CRUD + search/filter/pagination state
├── services/       # ticketApi.js — all raw REST calls
├── utils/          # ticketStore.js — local enrichment/persistence layer
└── App.jsx / main.jsx
```

## Features implemented

- Ticket list (responsive table on desktop, cards on mobile)
- Search by customer name, subject, or ticket ID
- Combinable status + priority filters
- Ticket details page (`/tickets/:id`) with full customer + ticket info
- Create Ticket form with validation (POST)
- Edit Ticket form for status/priority/agent/description (PUT)
- Delete with confirmation dialog (DELETE)
- Pagination (Previous | 1 2 3 … | Next)
- Dashboard summary cards computed from live data
- Loading, error (with retry), empty, and success states throughout
