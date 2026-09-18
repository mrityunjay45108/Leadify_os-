import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { RevenueChart } from '@/components/reports/RevenueChart'
import { ProductionStats } from '@/components/reports/ProductionStats'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const [
    clientCount,
    activeOrders,
    totalVideos,
    deliveredVideos,
    payments,
    expenses,
    payouts,
  ] = await Promise.all([
    db.client.count({ where: { status: 'ACTIVE' } }),
    db.order.count({ where: { status: 'IN_PRODUCTION' } }),
    db.video.count(),
    db.video.count({ where: { status: 'DELIVERED' } }),
    db.payment.findMany({ select: { amountReceived: true, createdAt: true } }),
    db.expense.findMany({ select: { amount: true, date: true } }),
    db.creatorPayout.findMany({ select: { totalPayout: true, createdAt: true } }),
  ])

  const totalRevenue = payments.reduce((s, p) => s + Number(p.amountReceived), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalPayouts = payouts.reduce((s, p) => s + Number(p.totalPayout), 0)
  const netProfit = totalRevenue - totalExpenses - totalPayouts

  return (
    <div>
      <Topbar title="Reports" subtitle="Executive analytics and performance overview" />
      <div className="p-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',   value: formatCurrency(totalRevenue),  color: 'text-green-400' },
            { label: 'Total Expenses',  value: formatCurrency(totalExpenses), color: 'text-orange-400' },
            { label: 'Creator Payouts', value: formatCurrency(totalPayouts),  color: 'text-purple-400' },
            { label: 'Net Profit',      value: formatCurrency(netProfit),     color: netProfit >= 0 ? 'text-amber-400' : 'text-red-400' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionStats
            totalVideos={totalVideos}
            deliveredVideos={deliveredVideos}
            activeOrders={activeOrders}
            activeClients={clientCount}
          />
          <RevenueChart payments={payments} />
        </div>
      </div>
    </div>
  )
}
