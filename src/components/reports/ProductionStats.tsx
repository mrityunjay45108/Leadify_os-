interface Props {
  totalVideos:     number
  deliveredVideos: number
  activeOrders:    number
  activeClients:   number
}

export function ProductionStats({ totalVideos, deliveredVideos, activeOrders, activeClients }: Props) {
  const deliveryRate = totalVideos > 0 ? Math.round((deliveredVideos / totalVideos) * 100) : 0

  const stats = [
    { label: 'Total Videos in System', value: totalVideos },
    { label: 'Videos Delivered',       value: deliveredVideos },
    { label: 'Delivery Rate',          value: `${deliveryRate}%` },
    { label: 'Active Orders',          value: activeOrders },
    { label: 'Active Clients',         value: activeClients },
  ]

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Production Summary</h3>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between py-2 border-b border-[#222] last:border-0">
            <span className="text-sm text-gray-400">{stat.label}</span>
            <span className="text-sm font-semibold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Delivery progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>Overall Delivery Rate</span>
          <span className="text-amber-400">{deliveryRate}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#2a2a2a]">
          <div
            className="h-2 rounded-full bg-amber-500 transition-all duration-700"
            style={{ width: `${deliveryRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
