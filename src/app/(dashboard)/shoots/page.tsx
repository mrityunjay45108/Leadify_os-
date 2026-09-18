import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ShootsCalendar } from '@/components/shoots/ShootsCalendar'

export default async function ShootsPage() {
  const shoots = await db.shoot.findMany({
    orderBy: { scheduledDate: 'asc' },
    where: {
      scheduledDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    include: {
      client:  { select: { name: true } },
      creator: { select: { name: true } },
      order:   { select: { packageName: true } },
    },
  })

  return (
    <div>
      <Topbar title="Shoots" subtitle="Schedule and manage all shoot bookings" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{shoots.length} upcoming shoots</p>
          <Link
            href="/shoots/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            Schedule Shoot
          </Link>
        </div>
        <ShootsCalendar shoots={shoots} />
      </div>
    </div>
  )
}
