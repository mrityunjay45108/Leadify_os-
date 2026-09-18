import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { TasksBoard } from '@/components/tasks/TasksBoard'

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      assignee:  { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  })

  return (
    <div>
      <Topbar title="Tasks" subtitle="Team task management and assignments" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{tasks.length} tasks</p>
          <Link
            href="/tasks/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            Add Task
          </Link>
        </div>
        <TasksBoard tasks={tasks} />
      </div>
    </div>
  )
}
