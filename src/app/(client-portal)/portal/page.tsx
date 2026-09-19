import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PortalScripts } from '@/components/portal/PortalScripts'
import { PortalVideos } from '@/components/portal/PortalVideos'
import { PortalInvoices } from '@/components/portal/PortalInvoices'
import { PortalSupport } from '@/components/portal/PortalSupport'

export default async function ClientPortalPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'CLIENT') redirect('/login')

  // Data Isolation enforced by only querying data where clientId matches this session's client
  const client = await db.client.findUnique({
    where: { userId: session.user.id },
    include: {
      orders: { orderBy: { createdAt: 'desc' } },
      scripts: {
        where: { status: { in: ['SENT_TO_CLIENT', 'REVISION_REQUIRED', 'APPROVED'] } },
        orderBy: { createdAt: 'desc' },
      },
      videos: {
        where: { status: { in: ['CLIENT_REVIEW', 'REVISION', 'FINAL_APPROVED', 'DELIVERED'] } },
        orderBy: { createdAt: 'desc' },
        include: { 
          script: { select: { videoNumber: true } },
          feedbackLogs: { orderBy: { createdAt: 'desc' } } 
        },
      },
      supportTickets: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!client) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <p className="text-gray-500">Your account is not linked to a client profile. Contact support.</p>
      </div>
    )
  }

  // Next.js Server->Client component serialization fix for Prisma Decimal objects
  const serializedOrders = client.orders.map(o => ({
    ...o,
    pricing: Number(o.pricing),
    gstAmount: o.gstAmount ? Number(o.gstAmount) : null,
    totalInvoice: Number(o.totalInvoice),
    amountReceived: Number(o.amountReceived),
    outstandingBalance: Number(o.outstandingBalance),
  }))

  const activeOrders = serializedOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
  const totalOrdered = serializedOrders.reduce((acc, o) => acc + o.videoCount, 0)
  const totalDelivered = serializedOrders.reduce((acc, o) => acc + o.deliveredVideos, 0)
  const remainingQuota = totalOrdered - totalDelivered
  
  // Video counts (across all orders)
  const inProdCount = await db.video.count({ where: { clientId: client.id, status: { in: ['SCRIPT_APPROVED', 'SHOOT_PENDING', 'RAW_FOOTAGE_RECEIVED', 'VIDEO_EDITING', 'INTERNAL_QA'] } } })
  const pendingClientCount = client.videos.filter(v => v.status === 'CLIENT_REVIEW').length
  const revisionCount = client.videos.filter(v => v.status === 'REVISION').length

  return (
    <div className="min-h-screen bg-[#111111] font-sans pb-20">
      {/* Header */}
      <header className="border-b border-[#222] bg-[#111] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-black shadow-lg shadow-amber-500/20">
            {client.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{client.name}</p>
            <p className="text-xs text-amber-500/80 font-medium">{client.companyName ?? client.brandName ?? 'Client Portal'}</p>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button className="text-xs font-medium text-gray-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#222] transition-colors">Sign Out</button>
        </form>
      </header>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        
        {/* Dashboard Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 flex flex-col justify-between">
            <p className="text-xs text-gray-500 font-medium">Remaining Quota</p>
            <p className="text-3xl font-bold text-amber-500 mt-1">{remainingQuota}</p>
            <p className="text-[10px] text-gray-600 mt-1">Videos left in your packages</p>
          </div>
          <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 flex flex-col justify-between">
            <p className="text-xs text-gray-500 font-medium">In Production</p>
            <p className="text-3xl font-bold text-white mt-1">{inProdCount}</p>
            <p className="text-[10px] text-gray-600 mt-1">Currently being edited/shot</p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col justify-between">
            <p className="text-xs text-amber-500 font-medium">Action Required</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{pendingClientCount}</p>
            <p className="text-[10px] text-amber-500/50 mt-1">Videos pending your approval</p>
          </div>
          <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 flex flex-col justify-between">
            <p className="text-xs text-gray-500 font-medium">Revisions</p>
            <p className="text-3xl font-bold text-orange-400 mt-1">{revisionCount}</p>
            <p className="text-[10px] text-gray-600 mt-1">Changes requested by you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Area (Scripts and Videos) */}
          <div className="lg:col-span-2 space-y-8">
            <PortalVideos videos={client.videos} />
            <PortalScripts scripts={client.scripts} />
          </div>

          {/* Sidebar Area (Orders, Invoices, Support) */}
          <div className="space-y-8">
            {activeOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Active Packages</h3>
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <div key={order.id} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
                      <p className="font-semibold text-sm text-white mb-2">{order.packageName}</p>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Ordered</span>
                        <span className="text-white">{order.videoCount}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Delivered</span>
                        <span className="text-white">{order.deliveredVideos}</span>
                      </div>
                      <div className="w-full bg-[#111] h-1.5 rounded-full mt-3 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (order.deliveredVideos / order.videoCount) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <PortalInvoices orders={serializedOrders} />
            <PortalSupport tickets={client.supportTickets} />
          </div>
        </div>
        
      </div>
    </div>
  )
}
