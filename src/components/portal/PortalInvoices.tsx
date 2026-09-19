'use client'

import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { DollarSign, CheckCircle, Clock } from 'lucide-react'

export function PortalInvoices({ orders }: { orders: any[] }) {
  // Extract invoices/payments from orders if you have a Payment model,
  // or just show Order payment status if Payment model is tied.
  // We'll show Order financials since Orders hold pricing.

  const financialOrders = orders.filter(o => o.totalInvoice > 0)

  if (financialOrders.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <DollarSign size={15} className="text-amber-500" />
        Invoices & Payments
      </h3>
      <div className="space-y-3">
        {financialOrders.map(order => {
          const isPaid = order.outstandingBalance <= 0
          return (
            <div key={order.id} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-sm">{order.packageName}</p>
                <p className="text-xs text-gray-500 mt-1">Order Date: {formatDate(order.createdAt)}</p>
                <div className="mt-2 text-xs">
                  <span className="text-gray-400">Total: </span>
                  <span className="text-white font-medium mr-3">{formatCurrency(order.totalInvoice)}</span>
                  <span className="text-gray-400">Paid: </span>
                  <span className="text-emerald-400 font-medium mr-3">{formatCurrency(order.amountReceived)}</span>
                  {!isPaid && (
                    <>
                      <span className="text-gray-400">Balance: </span>
                      <span className="text-orange-400 font-medium">{formatCurrency(order.outstandingBalance)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg border',
                isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
              )}>
                {isPaid ? <CheckCircle size={20} className="mb-1" /> : <Clock size={20} className="mb-1" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{isPaid ? 'Paid' : 'Pending'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
