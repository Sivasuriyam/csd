import { useEffect, useState } from 'react'
import { STATUSES, PRIORITIES, AGENTS } from '../utils/ticketStore'

const EMPTY_CREATE = {
  customerName: '',
  customerEmail: '',
  subject: '',
  description: '',
  priority: 'Medium',
  assignedAgent: AGENTS[0]
}

function validate(mode, form) {
  const errors = {}
  if (mode === 'create') {
    if (!form.customerName.trim()) errors.customerName = 'Customer name is required.'
    if (!form.customerEmail.trim()) {
      errors.customerEmail = 'Customer email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      errors.customerEmail = 'Enter a valid email address.'
    }
    if (!form.subject.trim() || form.subject.trim().length < 4) {
      errors.subject = 'Subject must be at least 4 characters.'
    }
  }
  if (!form.description.trim() || form.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.'
  }
  if (!form.assignedAgent) errors.assignedAgent = 'Please assign an agent.'
  return errors
}

export default function TicketForm({ mode, initialTicket, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    mode === 'edit' && initialTicket
      ? {
          customerName: initialTicket.customerName,
          customerEmail: initialTicket.customerEmail,
          subject: initialTicket.subject,
          description: initialTicket.description,
          priority: initialTicket.priority,
          status: initialTicket.status,
          assignedAgent: initialTicket.assignedAgent
        }
      : EMPTY_CREATE
  )
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(mode, form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(form)
    } catch (err) {
      setSubmitError('Could not save the ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            {mode === 'create' ? 'Create Ticket' : `Edit Ticket #${initialTicket.id}`}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' && (
            <>
              <Field label="Customer Name" error={errors.customerName}>
                <input
                  className="input"
                  value={form.customerName}
                  onChange={(e) => update('customerName', e.target.value)}
                />
              </Field>
              <Field label="Customer Email" error={errors.customerEmail}>
                <input
                  className="input"
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => update('customerEmail', e.target.value)}
                />
              </Field>
              <Field label="Subject" error={errors.subject}>
                <input
                  className="input"
                  value={form.subject}
                  onChange={(e) => update('subject', e.target.value)}
                />
              </Field>
            </>
          )}

          <Field label="Description" error={errors.description}>
            <textarea
              className="input min-h-[90px] resize-y"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <select className="input" value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            {mode === 'edit' && (
              <Field label="Status">
                <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <Field label="Assigned Agent" error={errors.assignedAgent}>
            <select
              className="input"
              value={form.assignedAgent}
              onChange={(e) => update('assignedAgent', e.target.value)}
            >
              {AGENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Create Ticket' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
