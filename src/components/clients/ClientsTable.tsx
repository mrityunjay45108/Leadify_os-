'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import type { Client, Employee, User } from '@prisma/client'

type ClientWithRelations = Client & {
  assignedEmployee: (Employee & { user: Pick<User, 'name'> }) | null
  _count: { orders: number; videos: number }
}

const statusStyles: Record<string, string> = {
  LEAD:       'bg-gray-700/60 text-gray-400',
  NEW:        'bg-blue-900/60 text-blue-400',
  ONBOARDING: 'bg-violet-900/60 text-violet-400',
  ACTIVE:     'bg-green-900/60 text-green-400',
  ON_HOLD:    'bg-orange-900/60 text-orange-400',
  COMPLETED:  'bg-teal-900/60 text-teal-400',
  INACTIVE:   'bg-gray-800/60 text-gray-600',
}

interface ClientsTableProps {
  clients: ClientWithRelations[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.companyName ?? '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden">
      {/* Filters */}
      <div className="flex items-center gap-3 p-4 border-b border-[#222]">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-64 rounded-lg bg-[#222] border border-[#2a2a2a] px-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-lg bg-[#222] border border-[#2a2a2a] px-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50"
        >
          <option value="ALL">All Status</option>
          {['LEAD', 'NEW', 'ONBOARDING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'INACTIVE'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#222] text-left">
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Videos</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e1e1e]">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-600">
                No clients found
              </td>
            </tr>
          ) : (
            filtered.map((client) => (
              <tr key={client.id} className="hover:bg-[#1e1e1e] transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-xs font-semibold text-amber-500 flex-shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                    statusStyles[client.status]
                  )}>
                    {client.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-300">{client._count.orders}</td>
                <td className="px-5 py-3.5 text-gray-300">{client._count.videos}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">
                  {client.assignedEmployee?.user.name ?? '—'}
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {formatDate(client.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/clients/${client.id}`}
                      className="p-1.5 rounded hover:bg-[#2a2a2a] text-gray-500 hover:text-white">
                      <Eye size={14} />
                    </Link>
                    <Link href={`/clients/${client.id}/edit`}
                      className="p-1.5 rounded hover:bg-[#2a2a2a] text-gray-500 hover:text-white">
                      <Edit size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table></div>
    </div>
  )
}
