'use client'

import { cn, formatDate } from '@/lib/utils'
import { AlertCircle, Circle, CheckCircle2 } from 'lucide-react'
import type { Task, User } from '@prisma/client'

type TaskWithRelations = Task & {
  assignee:  Pick<User, 'name'> | null
  createdBy: Pick<User, 'name'> | null
}

const priorityStyles: Record<string, string> = {
  URGENT: 'text-red-500 bg-red-900/40',
  HIGH:   'text-orange-400 bg-orange-900/40',
  MEDIUM: 'text-amber-400 bg-amber-900/40',
  LOW:    'text-gray-400 bg-gray-700/40',
}

const columns = [
  { key: 'TODO',        label: 'To Do',       icon: Circle,       iconColor: 'text-gray-500' },
  { key: 'IN_PROGRESS', label: 'In Progress',  icon: AlertCircle,  iconColor: 'text-amber-500' },
  { key: 'DONE',        label: 'Done',         icon: CheckCircle2, iconColor: 'text-green-500' },
]

export function TasksBoard({ tasks }: { tasks: TaskWithRelations[] }) {
  return (
    <div className="grid grid-cols-3 gap-5">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key)
        return (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-3">
              <col.icon size={15} className={col.iconColor} />
              <span className="text-sm font-medium text-white">{col.label}</span>
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#222] text-xs text-gray-500">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 hover:border-[#333] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-white leading-snug flex-1 pr-2">
                      {task.title}
                    </p>
                    <span className={cn(
                      'flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                      priorityStyles[task.priority]
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{task.assignee?.name ?? 'Unassigned'}</span>
                    {task.dueDate && (
                      <span className={cn(
                        new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                          ? 'text-red-400'
                          : 'text-gray-600'
                      )}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#2a2a2a] py-8 text-center text-xs text-gray-700">
                  No tasks
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
