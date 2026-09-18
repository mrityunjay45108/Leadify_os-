'use client'

import { useState } from 'react'
import { formatDate, cn } from '@/lib/utils'
import Link from 'next/link'
import { Eye, Edit } from 'lucide-react'
import type { Script, Client, Creator, Order } from '@prisma/client'

type ScriptWithRelations = Script & {
  client:  Pick<Client, 'name'>
  creator: Pick<Creator, 'name'> | null
  order:   Pick<Order, 'packageName'>
}

const statusColors: Record<string, string> = {
  DRAFT:              'bg-gray-700/60 text-gray-400',
  ASSIGNED:           'bg-blue-900/60 text-blue-400',
  IN_REVIEW:          'bg-violet-900/60 text-violet-400',
  SENT_TO_CLIENT:     'bg-cyan-900/60 text-cyan-400',
  REVISION_REQUIRED:  'bg-red-900/60 text-red-400',
  APPROVED:           'bg-green-900/60 text-green-400',
  READY_FOR_SHOOT:    'bg-amber-900/60 text-amber-400',
}

export function ScriptsTable({ scripts }: { scripts: ScriptWithRelations[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = scripts.filter((s) => {
    const matchSearch = s.client.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'ALL' || s.status === filter
    return matchSearch && matchStatus
  })

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-[#222]">
        <input
          type="text"
          placeholder="Search by client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-64 rounded-lg bg-[#222] border border-[#2a2a2a] px-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 rounded-lg bg-[#222] border border-[#2a2a2a] px-3 text-sm text-gray-300 focus:outline-none"
        >
          <option value="ALL">All Status</option>
          {Object.keys(statusColors).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#222] text-left">
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Script</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Revisions</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
            <th className="px-5 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e1e1e]">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-600">No scripts found</td>
            </tr>
          ) : (
            filtered.map((script) => (
              <tr key={script.id} className="hover:bg-[#1e1e1e] transition-colors group">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-white">Video #{script.videoNumber}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{script.order.packageName}</p>
                </td>
                <td className="px-5 py-3.5 text-gray-300">{script.client.name}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{script.creator?.name ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                    statusColors[script.status]
                  )}>
                    {script.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400">{script.revisionCount}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {script.deadline ? formatDate(script.deadline) : '—'}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Link href={`/scripts/${script.id}`} className="p-1.5 rounded hover:bg-[#2a2a2a] text-gray-500 hover:text-white">
                      <Eye size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
