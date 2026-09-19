import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Building2, Edit } from 'lucide-react'

const statusColors: Record<string, string> = {
  ACTIVE:   'bg-green-900/60 text-green-400',
  INACTIVE: 'bg-gray-700/60 text-gray-400',
  CHURNED:  'bg-red-900/60 text-red-400',
  PROSPECT: 'bg-blue-900/60 text-blue-400',
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await db.client.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { videos: true } } },
      },
      scripts: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      videos: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { script: { select: { videoNumber: true } } },
      },
      payments: { orderBy: { createdAt: 'desc' } },
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { user: { select: { name: true } } },
      },
      _count: { select: { orders: true, videos: true, scripts: true } },
    },
  })

  if (!client) notFound()

  const totalRevenue    = client.payments.reduce((s, p) => s + Number(p.amountReceived), 0)
  const totalOutstanding = client.payments.reduce((s, p) => s + Number(p.pendingBalance), 0)
  const deliveredVideos  = client.videos.filter((v) => v.status === 'DELIVERED').length

  return (
    <div>
      <Topbar title={client.name} subtitle={client.companyName ?? client.brandName ?? 'Client profile'} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to clients
          </Link>
          <Link href={`/clients/${client.id}/edit`} className="flex items-center gap-2 rounded-lg border border-[#333] px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <Edit size={13} /> Edit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client info card */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-lg font-bold text-amber-500">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.companyName ?? client.brandName ?? '—'}</p>
                  </div>
                </div>
                <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', statusColors[client.status])}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                {client.email && (
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <Mail size={13} />{client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <Phone size={13} />{client.phone}
                  </div>
                )}
                {client.industry && (
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <Building2 size={13} />{client.industry}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#222] text-xs text-gray-500">
                Client since {formatDate(client.createdAt)}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Orders',    value: client._count.orders },
                { label: 'Videos',    value: client._count.videos },
                { label: 'Delivered', value: deliveredVideos },
                { label: 'Scripts',   value: client._count.scripts },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-3 text-center">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Financials</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Revenue</span>
                <span className="text-green-400 font-medium">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Outstanding</span>
                <span className={cn('font-medium', totalOutstanding > 0 ? 'text-red-400' : 'text-gray-500')}>
                  {formatCurrency(totalOutstanding)}
                </span>
              </div>
            </div>
          </div>

          {/* Orders + Videos + Activity */}
          <div className="lg:col-span-2 space-y-5">
            {/* Orders */}
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Orders ({client.orders.length})</h3>
              {client.orders.length === 0 ? (
                <p className="text-sm text-gray-600">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {client.orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between py-2.5 border-b border-[#1e1e1e] last:border-0 hover:text-amber-400 transition-colors"
                    >
                      <div>
                        <p className="text-sm text-white">{order.packageName}</p>
                        <p className="text-xs text-gray-500">{order._count.videos} videos · {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{formatCurrency(Number(order.totalInvoice))}</p>
                        <p className="text-xs text-gray-500">{order.status.replace('_', ' ')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Videos */}
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Videos</h3>
              {client.videos.length === 0 ? (
                <p className="text-sm text-gray-600">No videos yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {client.videos.map((video) => (
                    <div key={video.id} className="rounded-lg border border-[#222] bg-[#111] p-3">
                      <p className="text-xs font-medium text-white">
                        {video.script ? `Video #${video.script.videoNumber}` : 'Video'}
                      </p>
                      <p className={cn('text-[10px] mt-1', {
                        'text-emerald-400': video.status === 'DELIVERED',
                        'text-green-400':   video.status === 'FINAL_APPROVED',
                        'text-amber-400':   video.status === 'CLIENT_REVIEW',
                        'text-orange-400':  video.status === 'REVISION',
                        'text-blue-400':    video.status === 'VIDEO_EDITING',
                        'text-gray-400':    !['DELIVERED','FINAL_APPROVED','CLIENT_REVIEW','REVISION','VIDEO_EDITING'].includes(video.status),
                      })}>
                        {video.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity */}
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Activity Log</h3>
              {client.activityLogs.length === 0 ? (
                <p className="text-sm text-gray-600">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {client.activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <div className="flex-1 flex items-start justify-between">
                        <p className="text-sm text-gray-300 capitalize">
                          {log.action.replace(/_/g, ' ')}
                          {log.user && <span className="text-gray-500"> by {log.user.name}</span>}
                        </p>
                        <p className="text-xs text-gray-600 ml-4 flex-shrink-0">{formatDate(log.createdAt)}</p>
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
