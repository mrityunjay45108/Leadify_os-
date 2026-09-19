import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LeadForm } from '@/components/leads/LeadForm'

export default async function NewLeadPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role === 'CLIENT') redirect('/portal')

  const users = await db.user.findMany({
    where:   { isActive: true, role: { in: ['OWNER', 'ADMIN', 'EMPLOYEE'] } },
    select:  { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <Topbar title="New Lead" subtitle="Add a prospect to your pipeline" />
      <div className="p-6 max-w-3xl">
        <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-6">
          <LeadForm users={users} />
        </div>
      </div>
    </div>
  )
}
