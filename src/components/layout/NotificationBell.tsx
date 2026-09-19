'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data)
      })
      .catch(console.error)

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    router.refresh()
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await fetch('/api/notifications', { method: 'PATCH' })
    router.refresh()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#222] bg-[#111] shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between p-3 border-b border-[#222] bg-[#1a1a1a]">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-1">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
            ) : (
              <div className="divide-y divide-[#1e1e1e]">
                {notifications.map(n => (
                  <div key={n.id} className={cn("p-3 transition-colors", !n.isRead ? "bg-amber-500/5" : "hover:bg-[#1a1a1a]")}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className={cn("text-xs font-semibold mb-0.5", !n.isRead ? "text-white" : "text-gray-400")}>{n.title}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-2">{n.message}</p>
                        <p className="text-[9px] text-gray-600 mt-1">{formatDate(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n.id)} className="text-amber-500 hover:text-amber-400 p-1" title="Mark as read">
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    {n.linkUrl && (
                      <Link href={n.linkUrl} onClick={() => { setIsOpen(false); if (!n.isRead) markAsRead(n.id); }} className="mt-2 inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                        View details <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
