import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { OrdersTable } from '@/components/orders/OrdersTable'

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, companyName: true } },
      _count: { select: { videos: true, scripts: true } },
    },
  })

  return (
    <div>
      <Topbar title="Orders" subtitle="Track all packages and production pipelines" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{orders.length} orders total</p>
          <Link
            href="/orders/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            New Order
          </Link>
        </div>
        <OrdersTable orders={orders} />
      </div>
    </div>
  )
}
