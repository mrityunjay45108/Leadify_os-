import { Topbar } from '@/components/layout/Topbar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { PipelineOverview } from '@/components/dashboard/PipelineOverview'
import { BottleneckTracker } from '@/components/dashboard/BottleneckTracker'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Users,
  ShoppingBag,
  Video,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

async function getDashboardData() {
  const [
    totalClients,
    activeOrders,
    pendingScripts,
    videosDelivered,
    pendingPayments,
    overdueVideos,
  ] = await Promise.all([
    db.client.count({ where: { status: 'ACTIVE' } }),
    db.order.count({ where: { status: 'IN_PRODUCTION' } }),
    db.script.count({ where: { status: { in: ['DRAFT', 'IN_REVIEW', 'REVISION_REQUIRED'] } } }),
    db.video.count({ where: { status: 'DELIVERED' } }),
    db.payment.count({ where: { status: { in: ['UNPAID', 'OVERDUE'] } } }),
    db.video.count({
      where: {
        deadline: { lt: new Date() },
        status: { notIn: ['DELIVERED', 'FINAL_APPROVED'] },
      },
    }),
  ])

  return {
    totalClients,
    activeOrders,
    pendingScripts,
    videosDelivered,
    pendingPayments,
    overdueVideos,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData()
  const isFinancialRole = ['OWNER', 'ADMIN'].includes(session?.user?.role ?? '')

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle={`Good to have you back, ${session?.user?.name?.split(' ')[0]}`}
      />

      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Active Clients"
            value={data.totalClients}
            icon={Users}
            trend="+3 this month"
            trendUp
          />
          <KpiCard
            label="Active Orders"
            value={data.activeOrders}
            icon={ShoppingBag}
            trend="In Production"
          />
          <KpiCard
            label="Videos Delivered"
            value={data.videosDelivered}
            icon={CheckCircle}
            trend="+12 this week"
            trendUp
            accent
          />
          <KpiCard
            label="Pending Scripts"
            value={data.pendingScripts}
            icon={Clock}
            trend="Needs attention"
            trendUp={false}
          />
        </div>

        {isFinancialRole && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              label="Pending Invoices"
              value={data.pendingPayments}
              icon={DollarSign}
              trend="Overdue risk"
              trendUp={false}
            />
            <KpiCard
              label="Overdue Videos"
              value={data.overdueVideos}
              icon={AlertCircle}
              trend="Action required"
              trendUp={false}
            />
            <KpiCard
              label="Net Revenue"
              value="₹0"
              icon={TrendingUp}
              trend="This month"
              trendUp
            />
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PipelineOverview />
            <BottleneckTracker overdueCount={data.overdueVideos} pendingScripts={data.pendingScripts} />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  )
}
