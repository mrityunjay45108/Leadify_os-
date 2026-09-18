import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate, cn } from '@/lib/utils'
import { FileText, Video, CheckCircle, XCircle, Clock, HelpCircle } from 'lucide-react'

export default async function ClientPortalPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'CLIENT') redirect('/login')

  // Get client linked to this user
  const client = await db.client.findUnique({
    where: { userId: session.user.id },
    include: {
      orders:  { orderBy: { createdAt: 'desc' } },
      scripts: {
        where: { status: { in: ['SENT_TO_CLIENT', 'REVISION_REQUIRED', 'APPROVED'] } },
        orderBy: { createdAt: 'desc' },
        include: { creator: { select: { name: true } } },
      },
      videos: {
        where: { status: { in: ['CLIENT_REVIEW', 'REVISION', 'FINAL_APPROVED', 'DELIVERED'] } },
        orderBy: { createdAt: 'desc' },
        include: { feedbackLogs: { orderBy: { createdAt: 'desc' }, take: 3 } },
      },
      supportTickets: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!client) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <p className="text-gray-500">Your account is not linked to a client profile. Contact support.</p>
      </div>
    )
  }

  const activeOrder = client.orders.find((o) => o.status === 'IN_PRODUCTION') ?? client.orders[0]

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Portal header */}
      <header className="border-b border-[#222] bg-[#111] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-black">
            {client.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{client.name}</p>
            <p className="text-xs text-gray-500">{client.companyName ?? client.brandName ?? ''}</p>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button className="text-xs text-gray-500 hover:text-white">Sign out</button>
        </form>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Active order summary */}
        {activeOrder && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-amber-500/70 font-medium uppercase tracking-wide mb-1">Active Package</p>
                <h2 className="text-lg font-semibold text-white">{activeOrder.packageName}</h2>
              </div>
              <span className="rounded-md bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
                {activeOrder.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              {[
                { label: 'Ordered',   value: activeOrder.videoCount },
                { label: 'Assigned',  value: activeOrder.assignedVideos },
                { label: 'Delivered', value: activeOrder.deliveredVideos },
                { label: 'Remaining', value: activeOrder.videoCount - activeOrder.deliveredVideos },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-[#1a1a1a] border border-[#222] p-3">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scripts for review */}
        {client.scripts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileText size={15} className="text-amber-500" />
              Scripts Awaiting Your Review
            </h3>
            <div className="space-y-3">
              {client.scripts.map((script) => (
                <div key={script.id} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">Video #{script.videoNumber}</p>
                      {script.creator && (
                        <p className="text-xs text-gray-500">Creator: {script.creator.name}</p>
                      )}
                    </div>
                    <span className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium',
                      script.status === 'APPROVED' ? 'bg-green-900/60 text-green-400' :
                      script.status === 'REVISION_REQUIRED' ? 'bg-red-900/60 text-red-400' :
                      'bg-amber-900/60 text-amber-400'
                    )}>
                      {script.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {script.scriptText && (
                    <p className="text-sm text-gray-400 bg-[#111] rounded-lg p-3 mt-2 whitespace-pre-wrap">
                      {script.scriptText}
                    </p>
                  )}
                  {script.status === 'SENT_TO_CLIENT' && (
                    <div className="flex gap-2 mt-3">
                      <ScriptActionButton scriptId={script.id} action="approve" />
                      <ScriptActionButton scriptId={script.id} action="revision" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos for review */}
        {client.videos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Video size={15} className="text-amber-500" />
              Videos for Review
            </h3>
            <div className="space-y-3">
              {client.videos.map((video) => (
                <div key={video.id} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-white">Video</p>
                    <span className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium',
                      video.status === 'DELIVERED' ? 'bg-emerald-900/60 text-emerald-400' :
                      video.status === 'FINAL_APPROVED' ? 'bg-green-900/60 text-green-400' :
                      video.status === 'REVISION' ? 'bg-orange-900/60 text-orange-400' :
                      'bg-amber-900/60 text-amber-400'
                    )}>
                      {video.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {video.driveLink && (
                    <a
                      href={video.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400"
                    >
                      View Video →
                    </a>
                  )}

                  {video.feedbackLogs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {video.feedbackLogs.map((f) => (
                        <div key={f.id} className="rounded-lg bg-[#111] p-2.5 text-xs text-gray-400">
                          {f.timestamp && <span className="text-amber-500 mr-2">[{f.timestamp}]</span>}
                          {f.feedback}
                        </div>
                      ))}
                    </div>
                  )}

                  {video.status === 'CLIENT_REVIEW' && (
                    <div className="flex gap-2 mt-3">
                      <VideoActionButton videoId={video.id} action="approve" />
                      <VideoActionButton videoId={video.id} action="revision" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support tickets */}
        {client.supportTickets.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <HelpCircle size={15} className="text-amber-500" />
              Support Tickets
            </h3>
            <div className="space-y-2">
              {client.supportTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(ticket.createdAt)}</p>
                  </div>
                  <span className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium',
                    ticket.status === 'RESOLVED' ? 'bg-green-900/60 text-green-400' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-amber-900/60 text-amber-400' :
                    'bg-blue-900/60 text-blue-400'
                  )}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Minimal action buttons — in production these would call API routes
function ScriptActionButton({ scriptId, action }: { scriptId: string; action: 'approve' | 'revision' }) {
  const isApprove = action === 'approve'
  return (
    <button className={cn(
      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
      isApprove
        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
    )}>
      {isApprove ? <CheckCircle size={13} /> : <XCircle size={13} />}
      {isApprove ? 'Approve Script' : 'Request Revision'}
    </button>
  )
}

function VideoActionButton({ videoId, action }: { videoId: string; action: 'approve' | 'revision' }) {
  const isApprove = action === 'approve'
  return (
    <button className={cn(
      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
      isApprove
        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
        : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
    )}>
      {isApprove ? <CheckCircle size={13} /> : <Clock size={13} />}
      {isApprove ? 'Approve Video' : 'Request Revision'}
    </button>
  )
}
