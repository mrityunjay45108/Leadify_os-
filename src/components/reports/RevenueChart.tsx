'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO, startOfMonth } from 'date-fns'

interface Payment {
  amountReceived: unknown
  createdAt: Date | string
}

interface Props {
  payments: Payment[]
}

export function RevenueChart({ payments }: Props) {
  // Group by month
  const monthlyMap: Record<string, number> = {}
  payments.forEach((p) => {
    const date = typeof p.createdAt === 'string' ? parseISO(p.createdAt) : p.createdAt
    const key = format(startOfMonth(date), 'MMM yy')
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(p.amountReceived)
  })

  const data = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }))

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Monthly Revenue</h3>
        <div className="flex h-48 items-center justify-center text-gray-600 text-sm">
          No payment data yet
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Monthly Revenue</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#fff' }}
            formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
