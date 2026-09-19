'use client'

import { useEffect, useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { formatDate, cn } from '@/lib/utils'
import { CheckCircle, Clock, Search, ShieldAlert, AlertCircle } from 'lucide-react'

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const fetchTickets = () => {
    fetch('/api/support')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTickets(data)
        setLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/support/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchTickets()
  }

  const handlePriorityChange = async (id: string, priority: string) => {
    await fetch(`/api/support/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority })
    })
    fetchTickets()
  }

  const filtered = tickets.filter(t => {
    if (filter !== 'ALL' && t.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      if (!t.subject.toLowerCase().includes(s) && !t.client.name.toLowerCase().includes(s)) return false
    }
    return true
  })

  return (
    <div>
      <Topbar title="Support Tickets" subtitle="Manage and resolve client support requests" />
      
      <div className="p-6 space-y-6">
        <div className="flex gap-4 p-4 rounded-xl border border-[#222] bg-[#1a1a1a]">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search subject or client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">Loading tickets...</div>
        ) : (
          <div className="grid gap-4">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm border border-[#222] rounded-xl bg-[#1a1a1a]">No tickets found.</div>
            ) : (
              filtered.map(ticket => (
                <div key={ticket.id} className="p-5 rounded-xl border border-[#222] bg-[#1a1a1a] flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded",
                        ticket.status === 'OPEN' ? "bg-red-500/20 text-red-400" :
                        ticket.status === 'IN_PROGRESS' ? "bg-blue-500/20 text-blue-400" :
                        "bg-green-500/20 text-green-400"
                      )}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={cn(
                        "text-[10px] uppercase font-bold flex items-center gap-1",
                        ticket.priority === 'HIGH' ? "text-red-400" :
                        ticket.priority === 'MEDIUM' ? "text-amber-400" : "text-gray-400"
                      )}>
                        {ticket.priority === 'HIGH' ? <ShieldAlert size={12}/> : <AlertCircle size={12}/>}
                        {ticket.priority} PRIORITY
                      </span>
                      <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                        <Clock size={12} /> {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-gray-400 mb-4 whitespace-pre-wrap">{ticket.description}</p>
                    <p className="text-xs text-gray-500">From Client: <span className="text-amber-500">{ticket.client.name}</span></p>
                  </div>
                  
                  <div className="flex flex-col gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-[#222] pt-4 md:pt-0 md:pl-6">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Update Status</label>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Update Priority</label>
                      <select
                        value={ticket.priority}
                        onChange={(e) => handlePriorityChange(ticket.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
