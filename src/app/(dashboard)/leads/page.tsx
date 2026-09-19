import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { LeadsBoard } from '@/components/leads/LeadsBoard'

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role === 'CLIENT') redirect('/portal')

  const leads = await db.lead.findMany({
    where:   { isArchived: false },
    orderBy: { createdAt: 'desc' },
    include: {
      assignee:  { select: { name: true, id: true } },
      _count:    { select: { notes: true } },
    },
  })

  const byStatus = {
    NEW:           leads.filter((l) => l.status === 'NEW'),
    CONTACTED:     leads.filter((l) => l.status === 'CONTACTED'),
    QUALIFIED:     leads.filter((l) => l.status === 'QUALIFIED'),
    PROPOSAL_SENT: leads.filter((l) => l.status === 'PROPOSAL_SENT'),
    NEGOTIATION:   leads.filter((l) => l.status === 'NEGOTIATION'),
    CONVERTED:     leads.filter((l) => l.status === 'CONVERTED'),
    LOST:          leads.filter((l) => l.status === 'LOST'),
  }

  const serialized = leads.map((l) => ({
    ...l,
    budget: l.budget ? Number(l.budget) : null,
  }))

  return (
    <div>
      <Topbar title="Leads" subtitle="CRM pipeline — track and convert prospects" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{leads.length} total</span>
            <span className="text-green-400">{byStatus.CONVERTED.length} converted</span>
            <span className="text-red-400">{byStatus.LOST.length} lost</span>
          </div>
          <Link
            href="/leads/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            Add Lead
          </Link>
        </div>
        <LeadsBoard leads={serialized} />
      </div>
    </div>
  )
}
