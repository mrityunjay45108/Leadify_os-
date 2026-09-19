'use client'

import { Bell, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { NotificationBell } from './NotificationBell'

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#222] bg-[#111111]/90 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            document.getElementById('app-sidebar')?.classList.remove('-translate-x-full')
            document.getElementById('sidebar-overlay')?.classList.remove('hidden')
          }}
          className="md:hidden p-1.5 -ml-1.5 text-gray-400 hover:text-white rounded-md hover:bg-[#1a1a1a]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="h-8 w-52 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] pl-8 pr-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Notifications */}
        <NotificationBell />
      </div>
    </header>
  )
}
