'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import {
  Phone, Mail, Building2, Calendar, ChevronRight,
  MessageSquare, User, MoreHorizontal
} from 'lucide-react'

type Lead = {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  source: string
  status: string
  budget: number | null
  followUpDate: Date | null
  createdAt: Date
  assignee: { name: string; id: string } | null
  _count: { notes: number }
}

const columns = [
  { key: 'NEW',           label: 'New',           color: 'text-blue-400',   dot: 'bg-blue-400' },
  { key: 'CONTACTED',     label: 'Contacted',     color: 'text-purple-400', dot: 'bg-purple-400' },
  { key: 'QUALIFIED',     label: 'Qualified',     color: 'text-yellow-400', dot: 'bg-yellow-400' },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'text-orange-400', dot: 'bg-orange-400' },
  { key: 'NEGOTIATION',   label: 'Negotiation',   color: 'text-pink-400',   dot: 'bg-pink-400' },
  { key: 'CONVERTED',     label: 'Converted',     color: 'text-green-400',  dot: 'bg-green-400' },
  { key: 'LOST',          label: 'Lost',          color: 'text-red-400',    dot: 'bg-red-400' },
]

function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter()
  const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date()

  return (
    <div
      onClick={() => router.push(`/leads/${lead.id}`)}
      className="rounded-xl border border-[#222] bg-[#111] p-4 cursor-pointer hover:border-amber-500/30 hover:bg-[#1a1a1a] transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
            {lead.name}
          </p>
          {lead.company && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Building2 size={10} />{lead.company}
            </p>
          )}
        </div>
        <ChevronRight size={14} className="text-gray-700 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-0.5" />
      </div>

      <div className="space-y-1 mt-2">
        {lead.phone && (
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            <Phone size={10} />{lead.phone}
          </p>
        )}
        {lead.email && (
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            <Mail size={10} /><span className="truncate">{lead.email}</span>
          </p>
        )}
      </div>

      {lead.budget && (
        <p className="mt-2 text-xs font-medium text-amber-500">
          {formatCurrency(lead.budget)}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e1e1e]">
        {lead.assignee ? (
          <p className="text-[10px] text-gray-600 flex items-center gap-1">
            <User size={9} />{lead.assignee.name}
          </p>
        ) : (
          <p className="text-[10px] text-gray-700">Unassigned</p>
        )}
        <div className="flex items-center gap-2">
          {lead._count.notes > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-600">
              <MessageSquare size={9} />{lead._count.notes}
            </span>
          )}
          {lead.followUpDate && (
            <span className={cn(
              'text-[10px] flex items-center gap-0.5',
              isOverdue ? 'text-red-400' : 'text-gray-600'
            )}>
              <Calendar size={9} />
              {new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function LeadsBoard({ leads }: { leads: Lead[] }) {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')

  const filtered = leads.filter((l) =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs rounded-lg border border-[#222] bg-[#1a1a1a] px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-amber-500/50"
        />
        <div className="flex rounded-lg border border-[#222] overflow-hidden">
          {(['kanban', 'table'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                view === v ? 'bg-amber-500 text-black' : 'bg-[#1a1a1a] text-gray-500 hover:text-white'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colLeads = filtered.filter((l) => l.status === col.key)
            return (
              <div key={col.key} className="flex-shrink-0 w-64">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={cn('h-2 w-2 rounded-full', col.dot)} />
                  <span className={cn('text-xs font-semibold', col.color)}>{col.label}</span>
                  <span className="ml-auto text-xs text-gray-600 bg-[#222] rounded px-1.5 py-0.5">
                    {colLeads.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {colLeads.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#222] p-4 text-center">
                      <p className="text-xs text-gray-700">No leads</p>
                    </div>
                  ) : (
                    colLeads.map((l) => <LeadCard key={l.id} lead={l} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222]">
                {['Name', 'Company', 'Phone', 'Source', 'Status', 'Assignee', 'Follow-up'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-600">No leads found</td></tr>
              ) : (
                filtered.map((lead) => {
                  const col = columns.find((c) => c.key === lead.status)
                  return (
                    <tr key={lead.id} className="hover:bg-[#1e1e1e] cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/leads/${lead.id}`} className="text-white hover:text-amber-400 font-medium transition-colors">
                          {lead.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{lead.company ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{lead.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{lead.source.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-medium', col?.color ?? 'text-gray-400')}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{lead.assignee?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {lead.followUpDate
                          ? new Date(lead.followUpDate).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
