import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ScriptsTable } from '@/components/scripts/ScriptsTable'

export default async function ScriptsPage() {
  const scripts = await db.script.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client:  { select: { name: true } },
      creator: { select: { name: true } },
      order:   { select: { packageName: true } },
    },
  })

  return (
    <div>
      <Topbar title="Scripts" subtitle="Manage script workflow from draft to shoot-ready" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{scripts.length} scripts total</p>
          <Link
            href="/scripts/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            New Script
          </Link>
        </div>
        <ScriptsTable scripts={scripts} />
      </div>
    </div>
  )
}
