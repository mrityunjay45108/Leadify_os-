import { db } from '@/lib/db'
import { timeAgo } from '@/lib/utils'

export async function ActivityFeed() {
  const logs = await db.activityLog.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      client: { select: { name: true } },
    },
  })

  const actionLabels: Record<string, string> = {
    created_client: '🧑 New client added',
    approved_script: '✅ Script approved',
    delivered_video: '🎬 Video delivered',
    payment_received: '💰 Payment received',
    created_order: '📦 New order created',
    shoot_scheduled: '📸 Shoot scheduled',
    revision_requested: '🔄 Revision requested',
  }

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Activity Feed</h3>
      <div className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-6">No activity yet</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300">
                  {actionLabels[log.action] ?? log.action}
                  {log.client?.name && (
                    <span className="text-amber-500/80"> — {log.client.name}</span>
                  )}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {log.user?.name ?? 'System'} · {timeAgo(log.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
