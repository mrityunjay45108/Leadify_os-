import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { FinancialsOverview } from '@/components/financials/FinancialsOverview'

export default async function FinancialsPage() {
  const [payments, expenses, payouts] = await Promise.all([
    db.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { name: true } }, order: { select: { packageName: true } } },
    }),
    db.expense.findMany({ orderBy: { date: 'desc' } }),
    db.creatorPayout.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { name: true } } },
    }),
  ])

  // Calculate summaries
  const totalReceived     = payments.reduce((sum, p) => sum + Number(p.amountReceived), 0)
  const totalOutstanding  = payments.reduce((sum, p) => sum + Number(p.pendingBalance), 0)
  const totalExpenses     = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalPayouts      = payouts.reduce((sum, p) => sum + Number(p.totalPayout), 0)
  const estimatedProfit   = totalReceived - totalExpenses - totalPayouts

  return (
    <div>
      <Topbar title="Financials" subtitle="Revenue, expenses, and creator payouts ledger" />
      <div className="p-6 space-y-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Revenue Received', value: totalReceived, color: 'text-green-400' },
            { label: 'Outstanding',      value: totalOutstanding, color: 'text-red-400' },
            { label: 'Total Expenses',   value: totalExpenses, color: 'text-orange-400' },
            { label: 'Creator Payouts',  value: totalPayouts, color: 'text-purple-400' },
            { label: 'Net Profit (Est)', value: estimatedProfit, color: estimatedProfit >= 0 ? 'text-amber-400' : 'text-red-400' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-xl font-bold ${item.color}`}>
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>

        <FinancialsOverview payments={payments} expenses={expenses} payouts={payouts} />
      </div>
    </div>
  )
}
