import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatDate, cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, Briefcase } from 'lucide-react'

const roleColors: Record<string, string> = {
  OWNER:    'bg-amber-900/60 text-amber-400',
  ADMIN:    'bg-purple-900/60 text-purple-400',
  EMPLOYEE: 'bg-blue-900/60 text-blue-400',
}

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const employee = await db.employee.findUnique({
    where: { id: params.id },
    include: {
      user: true,
    },
  })

  if (!employee) notFound()

  const tasks = await db.task.findMany({
    where:   { assigneeId: employee.userId },
    orderBy: { createdAt: 'desc' },
    take:    10,
  })

  const activityLogs = await db.activityLog.findMany({
    where:   { userId: employee.userId },
    orderBy: { createdAt: 'desc' },
    take:    15,
  })

  return (
    <div>
      <Topbar title={employee.user.name} subtitle="Employee profile" />
      <div className="p-6 space-y-6">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to employees
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-6">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-2xl font-bold text-amber-500 mb-3">
                {employee.user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold text-white">{employee.user.name}</h2>
              <p className="text-sm text-gray-500">{employee.designation ?? 'No designation set'}</p>
              <span className={cn('mt-2 rounded-md px-2 py-0.5 text-xs font-medium', roleColors[employee.user.role])}>
                {employee.user.role}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail size={14} className="flex-shrink-0" />
                <span className="truncate">{employee.user.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone size={14} />
                  {employee.phone}
                </div>
              )}
              {employee.department && (
                <div className="flex items-center gap-3 text-gray-400">
                  <Briefcase size={14} />
                  {employee.department}
                </div>
              )}
              {employee.joinedAt && (
                <div className="flex items-center gap-3 text-gray-400">
                  <Calendar size={14} />
                  Joined {formatDate(employee.joinedAt)}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#222] flex items-center justify-between text-xs">
              <span className="text-gray-500">Status</span>
              <span className={cn(
                'flex items-center gap-1.5',
                employee.user.isActive ? 'text-green-400' : 'text-red-400'
              )}>
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  employee.user.isActive ? 'bg-green-400' : 'bg-red-400'
                )} />
                {employee.user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Tasks + Activity */}
          <div className="lg:col-span-2 space-y-5">
            {/* Assigned Tasks */}
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">
                Assigned Tasks
                <span className="ml-2 text-xs text-gray-500 font-normal">({tasks.length})</span>
              </h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-600">No tasks assigned</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                    return (
                      <div key={task.id} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                        <div>
                          <p className="text-sm text-white">{task.title}</p>
                          {task.dueDate && (
                            <p className={cn('text-xs mt-0.5', isOverdue ? 'text-red-400' : 'text-gray-600')}>
                              {isOverdue ? '⚠ Overdue · ' : ''}{formatDate(task.dueDate)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                            task.priority === 'HIGH'   ? 'bg-red-900/40 text-red-400' :
                            task.priority === 'MEDIUM' ? 'bg-amber-900/40 text-amber-400' :
                            'bg-gray-700/40 text-gray-400'
                          )}>
                            {task.priority}
                          </span>
                          <span className={cn(
                            'text-xs',
                            task.status === 'DONE'        ? 'text-green-400' :
                            task.status === 'IN_PROGRESS' ? 'text-amber-400' :
                            'text-gray-500'
                          )}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Activity Log */}
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">
                Recent Activity
                <span className="ml-2 text-xs text-gray-500 font-normal">({activityLogs.length})</span>
              </h3>
              {activityLogs.length === 0 ? (
                <p className="text-sm text-gray-600">No activity recorded</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-300 capitalize">
                          {log.action.replace(/_/g, ' ')}
                          {log.entityType && (
                            <span className="text-gray-500"> · {log.entityType}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
