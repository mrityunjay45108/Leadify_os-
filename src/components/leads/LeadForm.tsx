'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const SOURCES = ['INSTAGRAM','REFERRAL','COLD_OUTREACH','WEBSITE','LINKEDIN','WHATSAPP','ORGANIC','OTHER']
const STATUSES = ['NEW','CONTACTED','QUALIFIED','PROPOSAL_SENT','NEGOTIATION','CONVERTED','LOST']

export function LeadForm({ users }: { users: { id: string; name: string }[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const body = {
      name:         fd.get('name'),
      company:      fd.get('company') || null,
      email:        fd.get('email')   || null,
      phone:        fd.get('phone')   || null,
      whatsapp:     fd.get('whatsapp') || null,
      source:       fd.get('source'),
      status:       fd.get('status'),
      requirements: fd.get('requirements') || null,
      budget:       fd.get('budget') ? Number(fd.get('budget')) : null,
      assigneeId:   fd.get('assigneeId') || null,
      followUpDate: fd.get('followUpDate') || null,
    }

    startTransition(async () => {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to create lead')
        return
      }
      const data = await res.json()
      router.push(`/leads/${data.id}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Name *" name="name" required placeholder="John Doe" />
        <Field label="Company" name="company" placeholder="Acme Corp" />
        <Field label="Email" name="email" type="email" placeholder="john@acme.com" />
        <Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" />
        <Field label="WhatsApp" name="whatsapp" placeholder="+91 98765 43210" />
        <Field label="Budget (₹)" name="budget" type="number" placeholder="50000" />
        <Field label="Follow-up Date" name="followUpDate" type="date" />

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Source</label>
          <select name="source" defaultValue="OTHER" className="field-input">
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Status</label>
          <select name="status" defaultValue="NEW" className="field-input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Assign To</label>
          <select name="assigneeId" className="field-input">
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Requirements / Notes</label>
        <textarea
          name="requirements"
          rows={4}
          placeholder="What does the prospect need?"
          className="field-input resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Creating...' : 'Create Lead'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[#333] px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function Field({
  label, name, required, placeholder, type = 'text',
}: {
  label: string; name: string; required?: boolean;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="field-input"
      />
    </div>
  )
}
