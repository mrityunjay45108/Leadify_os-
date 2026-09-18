import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  accent?: boolean
}

export function KpiCard({ label, value, icon: Icon, trend, trendUp, accent }: KpiCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-5 transition-colors',
      accent
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-[#222] bg-[#1a1a1a] hover:border-[#333]'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className={cn(
            'mt-1.5 text-3xl font-bold',
            accent ? 'text-amber-500' : 'text-white'
          )}>
            {value}
          </p>
        </div>
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          accent ? 'bg-amber-500/20' : 'bg-[#222]'
        )}>
          <Icon size={18} className={accent ? 'text-amber-500' : 'text-gray-400'} />
        </div>
      </div>
      {trend && (
        <p className={cn(
          'mt-3 text-xs',
          trendUp === true ? 'text-green-500' : trendUp === false ? 'text-red-400' : 'text-gray-500'
        )}>
          {trend}
        </p>
      )}
    </div>
  )
}
