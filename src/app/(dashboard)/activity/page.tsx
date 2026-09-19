import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { ActivityFeed } from '@/components/activity/ActivityFeed'

export default async function ActivityPage() {
  const session = await auth()
  
  // Security: Global activity is restricted based on role
  // Owners and Admins can see all
  // Employees only see what's explicitly related to them (mocked here, we could filter by userId or assignments)
  let logs: any[] = []

  if (session?.user?.role === 'OWNER' || session?.user?.role === 'ADMIN') {
    logs = await db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { name: true, role: true } },
        client: { select: { name: true } },
      }
    })
  } else if (session?.user?.role === 'EMPLOYEE') {
    logs = await db.activityLog.findMany({
      where: { userId: session.user.id }, // Simplistic restriction for employee
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true, role: true } },
        client: { select: { name: true } },
      }
    })
  }

  return (
    <div>
      <Topbar title="Global Activity Feed" subtitle="System-wide audit logs" />
      <div className="p-6">
        <ActivityFeed logs={logs} />
      </div>
    </div>
  )
}
