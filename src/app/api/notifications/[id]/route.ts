import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Mark single as read
export async function PATCH(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  
  const notification = await db.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
  }

  const updated = await db.notification.update({
    where: { id },
    data: { isRead: true }
  })

  return NextResponse.json(updated)
}
