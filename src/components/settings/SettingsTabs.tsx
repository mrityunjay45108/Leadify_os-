'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Users, Shield, Building2, Bell } from 'lucide-react'
import type { User, Employee } from '@prisma/client'

type UserRow = Pick<User, 'id' | 'name' | 'email' | 'role' | 'isActive' | 'createdAt'>
type EmployeeWithUser = Employee & { user: Pick<User, 'name' | 'email' | 'role'> }

const roleColors: Record<string, string> = {
  OWNER:    'bg-amber-900/60 text-amber-400',
  ADMIN:    'bg-purple-900/60 text-purple-400',
  EMPLOYEE: 'bg-blue-900/60 text-blue-400',
  CLIENT:   'bg-green-900/60 text-green-400',
}

export function SettingsTabs({
  users,
  employees,
}: {
  users: UserRow[]
  employees: EmployeeWithUser[]
}) {
  const [tab, setTab] = useState<'users' | 'roles' | 'agency' | 'notifications'>('users')

  const tabs = [
    { key: 'users'         as const, label: 'User Management', icon: Users },
    { key: 'roles'         as const, label: 'Roles & Permissions', icon: Shield },
    { key: 'agency'        as const, label: 'Agency Profile', icon: Building2 },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="flex gap-6">
      {/* Sidebar tabs */}
      <div className="w-52 flex-shrink-0">
        <nav className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors',
                tab === t.key
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-gray-500 hover:text-white hover:bg-[#222]'
              )}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">All Users</h2>
              <p className="text-sm text-gray-500">{users.length} accounts</p>
            </div>
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden">
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222]">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e1e]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#1e1e1e] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', roleColors[u.role])}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          'flex items-center gap-1.5 text-xs',
                          u.isActive ? 'text-green-400' : 'text-red-400'
                        )}>
                          <span className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            u.isActive ? 'bg-green-400' : 'bg-red-400'
                          )} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>
        )}

        {tab === 'roles' && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Roles & Access Levels</h2>
            <div className="space-y-3">
              {[
                {
                  role: 'OWNER',
                  color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  access: ['Full system access', 'Settings & configuration', 'Financial reports', 'User management', 'All modules'],
                },
                {
                  role: 'ADMIN',
                  color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                  access: ['All operational modules', 'Financial data', 'Employee management', 'Cannot access Settings'],
                },
                {
                  role: 'EMPLOYEE',
                  color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  access: ['Clients, Orders, Scripts', 'Creators & Shoots', 'Videos & Tasks', 'No financial data'],
                },
                {
                  role: 'CLIENT',
                  color: 'text-green-400 bg-green-500/10 border-green-500/20',
                  access: ['Client portal only', 'Script review & approval', 'Video review & feedback', 'Order status tracking'],
                },
              ].map((item) => (
                <div key={item.role} className={cn('rounded-xl border p-5', item.color)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{item.role}</span>
                    <span className="text-xs opacity-60">
                      {users.filter(u => u.role === item.role).length} user(s)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.access.map((a) => (
                      <span key={a} className="rounded bg-black/20 px-2 py-0.5 text-xs opacity-80">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'agency' && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Agency Profile</h2>
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-6 space-y-5">
              {[
                { label: 'Agency Name', placeholder: 'Leadyfy Agency', type: 'text' },
                { label: 'Contact Email', placeholder: 'hello@leadyfy.com', type: 'email' },
                { label: 'Phone', placeholder: '+91 98765 43210', type: 'tel' },
                { label: 'Website', placeholder: 'https://leadyfy.com', type: 'url' },
                { label: 'GST Number', placeholder: '27AAPFU0939F1ZV', type: 'text' },
                { label: 'Address', placeholder: 'Mumbai, Maharashtra', type: 'text' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs text-gray-500 mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#111] px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              ))}
              <button className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Notification Preferences</h2>
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] divide-y divide-[#222]">
              {[
                { label: 'New client added',         desc: 'When a new client is onboarded' },
                { label: 'Script pending review',    desc: 'When a script is sent to client' },
                { label: 'Video revision requested', desc: 'When client requests changes' },
                { label: 'Payment received',         desc: 'When a payment is logged' },
                { label: 'Shoot scheduled',          desc: 'When a new shoot is booked' },
                { label: 'Video delivered',          desc: 'When a video is marked as delivered' },
                { label: 'Overdue videos',           desc: 'Daily digest of overdue videos' },
                { label: 'Outstanding payments',     desc: 'Weekly outstanding balance report' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="h-5 w-9 rounded-full bg-[#333] peer-checked:bg-amber-500 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
