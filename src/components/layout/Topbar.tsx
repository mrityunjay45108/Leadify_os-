'use client'

import { Bell, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#222] bg-[#111111]/90 backdrop-blur-sm px-6">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
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
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white transition-colors">
          <Bell size={15} />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
            3
          </span>
        </button>
      </div>
    </header>
  )
}
