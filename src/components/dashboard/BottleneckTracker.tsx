import { AlertTriangle, Clock, FileText } from 'lucide-react'

interface Props {
  overdueCount: number
  pendingScripts: number
}

export function BottleneckTracker({ overdueCount, pendingScripts }: Props) {
  const items = [
    {
      icon: AlertTriangle,
      label: 'Overdue Videos',
      count: overdueCount,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      icon: FileText,
      label: 'Pending Script Approvals',
      count: pendingScripts,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Clock,
      label: 'Pending Client Approvals',
      count: 0,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ]

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Bottleneck Tracker</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg ${item.bg} border border-white/5 p-4 text-center`}
          >
            <div className={`flex justify-center mb-2 ${item.color}`}>
              <item.icon size={20} />
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
            <p className="text-[11px] text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
