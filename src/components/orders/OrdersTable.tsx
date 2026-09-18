'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { Eye, Edit } from 'lucide-react'
import type { Order, Client } from '@prisma/client'

type OrderWithRelations = Order & {
  client: Pick<Client, 'name' | 'companyName'>
  _count: { videos: number; scripts: number }
}

const statusStyles: Record<string, string> = {
  NEW:                 'bg-blue-900/60 text-blue-400',
  ONBOARDING:          'bg-violet-900/60 text-violet-400',
  IN_PRODUCTION:       'bg-amber-900/60 text-amber-400',
  PARTIALLY_DELIVERED: 'bg-cyan-900/60 text-cyan-400',
  COMPLETED:           'bg-green-900/60 text-green-400',
  ON_HOLD:             'bg-orange-900/60 text-orange-400',
  CANCELLED:           'bg-red-900/60 text-red-400',
}

export function OrdersTable({ orders }: { orders: OrderWithRelations[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.packageName.toLowerCase().includes(search.toLowerCase()) ||
      o.client.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'ALL' || o.status === filter
    return matchSearch && matchStatus
  })

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-[#222]">
        <input
          type="text"
          placeholder="Search orders..."
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
          {Object.keys(statusStyles).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#222] text-left">
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Videos</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
            <th className="px-5 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e1e1e]">
          {filtered.map((order) => (
            <tr key={order.id} className="hover:bg-[#1e1e1e] transition-colors group">
              <td className="px-5 py-3.5">
                <p className="font-medium text-white">{order.packageName}</p>
                <p className="text-xs text-gray-500">{order._count.scripts} scripts · {order._count.videos} videos</p>
              </td>
              <td className="px-5 py-3.5">
                <p className="text-white">{order.client.name}</p>
                {order.client.companyName && (
                  <p className="text-xs text-gray-500">{order.client.companyName}</p>
                )}
              </td>
              <td className="px-5 py-3.5">
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Ordered: {order.videoCount}</p>
                  <p>Delivered: {order.deliveredVideos}</p>
                  <div className="h-1 w-20 rounded-full bg-[#2a2a2a] mt-1">
                    <div
                      className="h-1 rounded-full bg-amber-500"
                      style={{ width: `${Math.min((order.deliveredVideos / order.videoCount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-white font-medium">
                {formatCurrency(Number(order.totalInvoice))}
              </td>
              <td className="px-5 py-3.5">
                <span className={cn(
                  'font-medium',
                  Number(order.outstandingBalance) > 0 ? 'text-red-400' : 'text-green-400'
                )}>
                  {formatCurrency(Number(order.outstandingBalance))}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <span className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                  statusStyles[order.status]
                )}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-5 py-3.5 text-gray-500 text-xs">
                {order.dueDate ? formatDate(order.dueDate) : '—'}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Link href={`/orders/${order.id}`} className="p-1.5 rounded hover:bg-[#2a2a2a] text-gray-500 hover:text-white">
                    <Eye size={14} />
                  </Link>
                  <Link href={`/orders/${order.id}/edit`} className="p-1.5 rounded hover:bg-[#2a2a2a] text-gray-500 hover:text-white">
                    <Edit size={14} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
