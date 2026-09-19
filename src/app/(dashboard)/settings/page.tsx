import { Topbar } from '@/components/layout/Topbar'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'OWNER') redirect('/dashboard')

  const [users, employees] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, name: true, email: true,
        role: true, isActive: true, createdAt: true,
      },
    }),
    db.employee.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
    }),
  ])

  return (
    <div>
      <Topbar title="Settings" subtitle="Agency configuration and user management" />
      <div className="p-6">
        <SettingsTabs users={users} employees={employees} />
      </div>
    </div>
  )
}
