'use client'

import { useState } from 'react'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import type { Payment, Expense, CreatorPayout, Client, Order, Creator } from '@prisma/client'

type PaymentWithRelations  = Payment  & { client: Pick<Client, 'name'>; order: Pick<Order, 'packageName'> }
type PayoutWithRelations   = CreatorPayout & { creator: Pick<Creator, 'name'> }

type Tab = 'payments' | 'expenses' | 'payouts'

const paymentStatusStyles: Record<string, string> = {
  UNPAID:         'bg-red-900/60 text-red-400',
  PARTIALLY_PAID: 'bg-amber-900/60 text-amber-400',
  PAID:           'bg-green-900/60 text-green-400',
  OVERDUE:        'bg-red-900/80 text-red-300',
}

const payoutStatusStyles: Record<string, string> = {
  PENDING:  'bg-amber-900/60 text-amber-400',
  APPROVED: 'bg-blue-900/60 text-blue-400',
  PAID:     'bg-green-900/60 text-green-400',
}

interface Props {
  payments: PaymentWithRelations[]
  expenses: Expense[]
  payouts:  PayoutWithRelations[]
}

export function FinancialsOverview({ payments, expenses, payouts }: Props) {
  const [tab, setTab] = useState<Tab>('payments')

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'payments', label: 'Client Payments', count: payments.length },
    { key: 'expenses', label: 'Agency Expenses', count: expenses.length },
    { key: 'payouts',  label: 'Creator Payouts', count: payouts.length },
  ]

  return (
    <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#222]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === t.key
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-gray-500 hover:text-white'
            )}
          >
            {t.label}
            <span className={cn(
              'rounded-full px-1.5 text-xs',
              tab === t.key ? 'bg-amber-500/20 text-amber-400' : 'bg-[#222] text-gray-500'
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Payments */}
      {tab === 'payments' && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222] text-left">
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-[#1e1e1e]">
                <td className="px-5 py-3.5 text-white font-medium">{p.client.name}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{p.order.packageName}</td>
                <td className="px-5 py-3.5 text-gray-300">{formatCurrency(Number(p.invoiceAmount))}</td>
                <td className="px-5 py-3.5 text-green-400">{formatCurrency(Number(p.amountReceived))}</td>
                <td className="px-5 py-3.5 text-red-400">{formatCurrency(Number(p.pendingBalance))}</td>
                <td className="px-5 py-3.5">
                  <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-medium', paymentStatusStyles[p.status])}>
                    {p.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {p.paymentDate ? formatDate(p.paymentDate) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Expenses */}
      {tab === 'expenses' && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222] text-left">
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-[#1e1e1e]">
                <td className="px-5 py-3.5">
                  <span className="inline-flex rounded bg-[#222] px-2 py-0.5 text-xs text-gray-400">
                    {e.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-300">{e.description ?? '—'}</td>
                <td className="px-5 py-3.5 text-orange-400 font-medium">{formatCurrency(Number(e.amount))}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">{formatDate(e.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Creator Payouts */}
      {tab === 'payouts' && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222] text-left">
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Videos</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/Video</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payout</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-[#1e1e1e]">
                <td className="px-5 py-3.5 text-white font-medium">{p.creator.name}</td>
                <td className="px-5 py-3.5 text-gray-300">{p.videoCount}</td>
                <td className="px-5 py-3.5 text-gray-400">{formatCurrency(Number(p.ratePerVideo))}</td>
                <td className="px-5 py-3.5 text-purple-400 font-medium">{formatCurrency(Number(p.totalPayout))}</td>
                <td className="px-5 py-3.5">
                  <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-medium', payoutStatusStyles[p.status])}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {p.paymentDate ? formatDate(p.paymentDate) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
