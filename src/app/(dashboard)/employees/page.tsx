import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'

export default async function EmployeesPage() {
  const employees = await db.employee.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, role: true, isActive: true } },
    },
  })

  return (
    <div>
      <Topbar title="Employees" subtitle="Staff directory and role management" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{employees.length} team members</p>
          <Link
            href="/employees/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            Add Employee
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <Link
              key={emp.id}
              href={`/employees/${emp.id}`}
              className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5 hover:border-[#333] transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-500">
                  {emp.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{emp.user.name}</p>
                    {!emp.user.isActive && (
                      <span className="flex-shrink-0 text-xs text-red-400 bg-red-900/30 rounded px-1.5 py-0.5">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{emp.user.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-500">
                {emp.designation && (
                  <div className="flex items-center justify-between">
                    <span>Role</span>
                    <span className="text-gray-300">{emp.designation}</span>
                  </div>
                )}
                {emp.department && (
                  <div className="flex items-center justify-between">
                    <span>Department</span>
                    <span className="text-gray-300">{emp.department}</span>
                  </div>
                )}
                {emp.joinedAt && (
                  <div className="flex items-center justify-between">
                    <span>Joined</span>
                    <span className="text-gray-300">{formatDate(emp.joinedAt)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-[#222]">
                <span className={cn(
                  'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                  emp.user.role === 'OWNER' ? 'bg-amber-900/60 text-amber-400' :
                  emp.user.role === 'ADMIN'  ? 'bg-purple-900/60 text-purple-400' :
                  'bg-blue-900/60 text-blue-400'
                )}>
                  {emp.user.role}
                </span>
              </div>
            </Link>
          ))}

          {employees.length === 0 && (
            <div className="col-span-3 py-16 text-center">
              <Users size={32} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-600">No employees added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
