import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Building2, Calendar, Target, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { LeadDetailClient } from '@/components/leads/LeadDetailClient'

const statusColors: Record<string, string> = {
  NEW:           'bg-blue-900/60 text-blue-400',
  CONTACTED:     'bg-purple-900/60 text-purple-400',
  QUALIFIED:     'bg-yellow-900/60 text-yellow-400',
  PROPOSAL_SENT: 'bg-orange-900/60 text-orange-400',
  NEGOTIATION:   'bg-pink-900/60 text-pink-400',
  CONVERTED:     'bg-green-900/60 text-green-400',
  LOST:          'bg-red-900/60 text-red-400',
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role === 'CLIENT') redirect('/portal')

  const [lead, users] = await Promise.all([
    db.lead.findUnique({
      where: { id: params.id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        notes:    { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    }),
    db.user.findMany({
      where:  { isActive: true, role: { in: ['OWNER', 'ADMIN', 'EMPLOYEE'] } },
      select: { id: true, name: true },
    }),
  ])

  if (!lead) notFound()

  const serialized = {
    ...lead,
    budget: lead.budget ? Number(lead.budget) : null,
  }

  return (
    <div>
      <Topbar title={lead.name} subtitle={lead.company ?? 'Lead detail'} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/leads" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to leads
          </Link>
          <span className={cn('rounded-md px-3 py-1 text-xs font-semibold', statusColors[lead.status] ?? 'bg-gray-700 text-gray-400')}>
            {lead.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info panel */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-xl font-bold text-amber-500">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.source.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                {lead.company && <div className="flex items-center gap-2.5 text-gray-400"><Building2 size={13} />{lead.company}</div>}
                {lead.email   && <div className="flex items-center gap-2.5 text-gray-400"><Mail size={13} />{lead.email}</div>}
                {lead.phone   && <div className="flex items-center gap-2.5 text-gray-400"><Phone size={13} />{lead.phone}</div>}
                {lead.budget  && (
                  <div className="flex items-center gap-2.5 text-amber-500 font-medium">
                    <DollarSign size={13} />{formatCurrency(Number(lead.budget))}
                  </div>
                )}
                {lead.followUpDate && (
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <Calendar size={13} />Follow-up: {formatDate(lead.followUpDate)}
                  </div>
                )}
              </div>

              {lead.requirements && (
                <div className="mt-4 pt-4 border-t border-[#222]">
                  <p className="text-xs text-gray-500 mb-1">Requirements</p>
                  <p className="text-sm text-gray-300">{lead.requirements}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#222] text-xs text-gray-500">
                Added {formatDate(lead.createdAt)}
              </div>
            </div>

            {/* Quick actions */}
            {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
              <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
                <div className="space-y-2">
                  {lead.status !== 'CONVERTED' && (
                    <Link
                      href={`/clients/new?fromLead=${lead.id}&name=${encodeURIComponent(lead.name)}&email=${encodeURIComponent(lead.email ?? '')}&company=${encodeURIComponent(lead.company ?? '')}&phone=${encodeURIComponent(lead.phone ?? '')}`}
                      className="flex items-center gap-2 w-full rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2.5 text-sm text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      <Target size={14} />
                      Convert to Client
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive panel */}
          <div className="lg:col-span-2">
            <LeadDetailClient lead={serialized} users={users} currentUserId={session.user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
