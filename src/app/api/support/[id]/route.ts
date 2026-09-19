// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session?.user || session.user.role === 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { status, priority } = await req.json()

  const updateData: any = {}
  if (status) updateData.status = status
  if (priority) updateData.priority = priority

  if (status === 'RESOLVED') {
    updateData.resolvedAt = new Date()
  } else if (status) {
    updateData.resolvedAt = null
  }

  const ticket = await db.supportTicket.update({
    where: { id },
    data: updateData,
    include: { client: { select: { userId: true } } }
  })

  // Notify client if resolved
  if (status === 'RESOLVED' && ticket.client?.userId) {
    const { createNotification } = await import('@/lib/notifications')
    await createNotification({
      userId: ticket.client.userId,
      title: 'Support Ticket Resolved',
      message: `Your support ticket "${ticket.subject}" has been marked as resolved.`,
      type: 'SYSTEM',
      linkUrl: '/portal',
      entityType: 'ticket',
      entityId: ticket.id
    })
  }

  return NextResponse.json(ticket)
}
