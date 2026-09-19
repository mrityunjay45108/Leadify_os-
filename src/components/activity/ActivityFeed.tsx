'use client'

import { useState } from 'react'
import { Search, Filter, Clock } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'

export function ActivityFeed({ logs }: { logs: any[] }) {
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('ALL')

  const filtered = logs.filter(log => {
    if (search) {
      const s = search.toLowerCase()
      if (
        !log.action.toLowerCase().includes(s) &&
        !log.user?.name?.toLowerCase().includes(s) &&
        !log.client?.name?.toLowerCase().includes(s)
      ) return false
    }
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false
    return true
  })

  // Format action text beautifully
  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 p-4 rounded-xl border border-[#222] bg-[#1a1a1a]">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search activity, users, or clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        
        <select
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">All Entities</option>
          <option value="video">Videos</option>
          <option value="script">Scripts</option>
          <option value="client">Clients</option>
          <option value="order">Orders</option>
          <option value="payment">Payments</option>
        </select>
      </div>

      {/* Feed Table */}
      <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm text-left">
          <thead className="bg-[#111] border-b border-[#222]">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Entity</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-[#111] transition-colors">
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-400 text-xs flex items-center gap-1.5">
                  <Clock size={12} /> {formatDate(log.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-medium text-white">{formatAction(log.action)}</span>
                </td>
                <td className="px-5 py-3.5">
                  {log.user ? (
                    <div>
                      <p className="text-gray-300">{log.user.name}</p>
                      <p className="text-[10px] text-gray-600">{log.user.role}</p>
                    </div>
                  ) : <span className="text-gray-600">System</span>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-amber-500/70">{log.entityType}</span>
                    <span className="text-xs text-gray-500 font-mono truncate max-w-[120px]">{log.entityId}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs max-w-xs truncate">
                  {log.client && <span className="text-amber-400 mr-2">Client: {log.client.name}</span>}
                  {log.metadata && JSON.stringify(log.metadata).length > 2 && (
                    <span className="text-gray-500 font-mono">{JSON.stringify(log.metadata)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">No activity matches your filters.</div>
        )}
      </div>
    </div>
  )
}
