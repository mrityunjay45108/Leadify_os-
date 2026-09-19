'use client'

import { useState } from 'react'
import { HelpCircle, Plus, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, formatDate } from '@/lib/utils'

export function PortalSupport({ tickets }: { tickets: any[] }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.message) return
    setLoading(true)
    
    try {
      await fetch('/api/portal/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setForm({ subject: '', message: '' })
      setIsCreating(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <HelpCircle size={15} className="text-amber-500" />
          Support Tickets
        </h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-400"
        >
          <Plus size={13} /> {isCreating ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <input
            placeholder="Subject (e.g., Question about my invoice)"
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            className="w-full bg-[#111] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none"
            required
          />
          <textarea
            placeholder="How can we help?"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full bg-[#111] border border-[#333] rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none min-h-[100px]"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !form.subject || !form.message}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : <><Send size={13} /> Submit Ticket</>}
            </button>
          </div>
        </form>
      )}

      {tickets.length > 0 ? (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-sm">{ticket.subject}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(ticket.createdAt)}</p>
              </div>
              <span className={cn(
                'rounded-md px-2 py-0.5 text-xs font-medium',
                ticket.status === 'RESOLVED' ? 'bg-green-900/60 text-green-400' :
                ticket.status === 'IN_PROGRESS' ? 'bg-amber-900/60 text-amber-400' :
                'bg-blue-900/60 text-blue-400'
              )}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        !isCreating && (
          <div className="text-center py-6 text-sm text-gray-500 border border-dashed border-[#222] rounded-xl">
            No support tickets yet.
          </div>
        )
      )}
    </div>
  )
}
