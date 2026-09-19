'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  Video,
  Camera,
  UserCheck,
  DollarSign,
  CheckSquare,
  UserCog,
  BarChart2,
  Settings,
  LogOut,
  Zap,
  LifeBuoy
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: Users,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingBag,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Scripts',
    href: '/scripts',
    icon: FileText,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Creators',
    href: '/creators',
    icon: UserCheck,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Shoots',
    href: '/shoots',
    icon: Camera,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Videos',
    href: '/videos',
    icon: Video,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Financials',
    href: '/financials',
    icon: DollarSign,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Support',
    href: '/support',
    icon: LifeBuoy,
    roles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: UserCog,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart2,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['OWNER'],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as string

  const filtered = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <>
      <aside 
        id="app-sidebar" 
        className="fixed left-0 top-0 z-50 h-screen w-60 border-r border-[#222] bg-[#111111] flex flex-col transition-transform -translate-x-full md:translate-x-0"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <Zap size={16} className="text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Leadyfy <span className="text-amber-500">OS</span>
            </span>
          </div>
          <button 
            onClick={() => {
              document.getElementById('app-sidebar')?.classList.add('-translate-x-full')
              document.getElementById('sidebar-overlay')?.classList.add('hidden')
            }}
            className="md:hidden text-gray-500 hover:text-white"
          >
            &times;
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {filtered.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  document.getElementById('app-sidebar')?.classList.add('-translate-x-full')
                  document.getElementById('sidebar-overlay')?.classList.add('hidden')
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-[#222] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
              {session?.user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {userRole?.toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-[#1a1a1a] hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div 
        id="sidebar-overlay"
        onClick={() => {
          document.getElementById('app-sidebar')?.classList.add('-translate-x-full')
          document.getElementById('sidebar-overlay')?.classList.add('hidden')
        }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm hidden md:hidden"
      />
    </>
  )
}
