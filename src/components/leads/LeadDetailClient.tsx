'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, cn } from '@/lib/utils'
import { Send, User } from 'lucide-react'

const STATUSES = ['NEW','CONTACTED','QUALIFIED','PROPOSAL_SENT','NEGOTIATION','CONVERTED','LOST'] as const
const statusColors: Record<string, string> = {
  NEW:           'bg-blue-900/60 text-blue-400',
  CONTACTED:     'bg-purple-900/60 text-purple-400',
  QUALIFIED:     'bg-yellow-900/60 text-yellow-400',
  PROPOSAL_SENT: 'bg-orange-900/60 text-orange-400',
  NEGOTIATION:   'bg-pink-900/60 text-pink-400',
  CONVERTED:     'bg-green-900/60 text-green-400',
  LOST:          'bg-red-900/60 text-red-400',
}

type Note = { id: string; note: string; createdAt: Date; author: { name: string } | null }
type Lead = {
  id: string; name: string; status: string; assigneeId: string | null
  notes: Note[]; activityLogs: { id: string; action: string; createdAt: Date }[]
}

export function LeadDetailClient({
  lead, users, currentUserId,
}: {
  lead: Lead
  users: { id: string; name: string }[]
  currentUserId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [note, setNote] = useState('')
  const [status, setStatus] = useState(lead.status)
  const [assigneeId, setAssigneeId] = useState(lead.assigneeId ?? '')
  const [notes, setNotes] = useState<Note[]>(lead.notes)
  const [tab, setTab] = useState<'notes' | 'activity'>('notes')

  async function saveStatus(newStatus: string) {
    setStatus(newStatus)
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  async function saveAssignee(id: string) {
    setAssigneeId(id)
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigneeId: id || null }),
    })
    router.refresh()
  }

  async function addNote() {
    if (!note.trim()) return
    const res = await fetch(`/api/leads/${lead.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    if (res.ok) {
      const data = await res.json()
      setNotes([data, ...notes])
      setNote('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Status + Assignee inline editors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
          <p className="text-xs text-gray-500 mb-2">Pipeline Stage</p>
          <select
            value={status}
            onChange={(e) => saveStatus(e.target.value)}
            className={cn('w-full rounded-lg px-3 py-2 text-sm font-semibold border-0 focus:outline-none', statusColors[status])}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
          <p className="text-xs text-gray-500 mb-2">Assigned To</p>
          <select
            value={assigneeId}
            onChange={(e) => saveAssignee(e.target.value)}
            className="w-full rounded-lg bg-[#111] border border-[#2a2a2a] px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>

      {/* Notes & Activity */}
      <div className="rounded-xl border border-[#222] bg-[#1a1a1a]">
        <div className="flex border-b border-[#222]">
          {(['notes', 'activity'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-5 py-3 text-sm font-medium capitalize transition-colors',
                tab === t ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-white'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'notes' && (
            <div>
              {/* Add note input */}
              <div className="flex gap-2 mb-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Add a note, follow-up, or update..."
                  className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-amber-500/50 resize-none"
                />
                <button
                  onClick={addNote}
                  disabled={!note.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-40 transition-colors self-end"
                >
                  <Send size={13} />
                </button>
              </div>

              {notes.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">No notes yet — add one above</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg bg-[#111] p-3 border border-[#1e1e1e]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <User size={10} />{n.author?.name ?? 'System'}
                        </span>
                        <span className="text-[10px] text-gray-700">{formatDate(n.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-300">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="space-y-3">
              {lead.activityLogs.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">No activity yet</p>
              ) : (
                lead.activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <div className="flex-1 flex items-start justify-between">
                      <p className="text-sm text-gray-400 capitalize">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-gray-600 ml-4">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
