import { Topbar } from '@/components/layout/Topbar'
import { ClientsTable } from '@/components/clients/ClientsTable'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assignedEmployee: {
        include: { user: { select: { name: true } } },
      },
      _count: {
        select: { orders: true, videos: true },
      },
    },
  })

  return (
    <div>
      <Topbar title="Clients" subtitle="Manage client accounts and pipelines" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-medium">{clients.length} total clients</h2>
          </div>
          <Link
            href="/clients/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            Add Client
          </Link>
        </div>
        <ClientsTable clients={clients} />
      </div>
    </div>
  )
}
