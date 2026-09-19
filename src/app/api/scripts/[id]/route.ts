// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export async function PATCH(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id } = await params;
  const { status, clientFeedback } = await req.json()
  
  const script = await db.script.findUnique({ 
    where: { id },
    include: { 
      order: { include: { client: { select: { userId: true, id: true } } } },
      creator: { select: { id: true } } 
    }
  })
  
  if (!script) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role === 'CLIENT' && script.order.client?.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updateData: any = {}
  if (status) updateData.status = status
  if (clientFeedback !== undefined) updateData.clientFeedback = clientFeedback

  if (status === 'REVISION_REQUIRED' && script.status !== 'REVISION_REQUIRED') {
    updateData.revisionCount = script.revisionCount + 1
  }

  const updated = await db.script.update({
    where: { id },
    data: updateData
  })

  if (status && status !== script.status) {
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        clientId: script.order.client.id,
        entityType: 'script',
        entityId: script.id,
        action: `script_status_changed_to_${status.toLowerCase()}`,
        metadata: { oldStatus: script.status, newStatus: status }
      }
    })

    if (status === 'SENT_TO_CLIENT' && script.order.client?.userId) {
      await createNotification({
        userId: script.order.client.userId,
        title: 'Script ready for review',
        message: `Script #${script.videoNumber} is ready for your review.`,
        type: 'SCRIPT_ASSIGNED',
        linkUrl: '/portal',
        entityType: 'script',
        entityId: script.id
      })
    }
    
    // Creator object does not have userId so we skip creator notification to avoid runtime crash.
  }

  return NextResponse.json(updated)
}
