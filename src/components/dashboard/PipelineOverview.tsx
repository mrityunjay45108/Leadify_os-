import { db } from '@/lib/db'

const stages = [
  { key: 'SCRIPT_APPROVED',      label: 'Script Approved',   color: 'bg-purple-500' },
  { key: 'SHOOT_PENDING',         label: 'Shoot Pending',     color: 'bg-blue-500' },
  { key: 'RAW_FOOTAGE_RECEIVED',  label: 'Raw Footage',       color: 'bg-indigo-500' },
  { key: 'VIDEO_EDITING',         label: 'Editing',           color: 'bg-cyan-500' },
  { key: 'INTERNAL_QA',           label: 'Internal QA',       color: 'bg-teal-500' },
  { key: 'CLIENT_REVIEW',         label: 'Client Review',     color: 'bg-amber-500' },
  { key: 'REVISION',              label: 'Revision',          color: 'bg-orange-500' },
  { key: 'FINAL_APPROVED',        label: 'Final Approved',    color: 'bg-green-500' },
  { key: 'DELIVERED',             label: 'Delivered',         color: 'bg-emerald-600' },
]

export async function PipelineOverview() {
  const counts = await db.video.groupBy({
    by: ['status'],
    _count: { id: true },
  })

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count.id]))
  const total = Object.values(countMap).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Video Pipeline</h3>
      <div className="space-y-2.5">
        {stages.map((stage) => {
          const count = countMap[stage.key] ?? 0
          const pct = Math.round((count / total) * 100)
          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{stage.label}</span>
                <span className="text-xs text-white font-medium">{count}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#2a2a2a]">
                <div
                  className={`h-1.5 rounded-full ${stage.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
