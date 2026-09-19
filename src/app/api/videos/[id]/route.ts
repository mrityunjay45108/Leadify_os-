// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export async function GET(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params;
  const video = await db.video.findUnique({
    where: { id },
    include: {
      client: true,
      order: true,
      script: true,
      creator: true,
      shoot: true,
      feedbackLogs: { orderBy: { createdAt: 'desc' } }
    }
  })

  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(video)
}

export async function PATCH(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id } = await params;
  
  const body = await req.json()
  const { status, driveLink, finalDeliveryUrl, assignedEditorId, deadline, internalNotes } = body
  
  const video = await db.video.findUnique({ 
    where: { id },
    include: { client: { select: { userId: true } } }
  })
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Data isolation: Clients can only modify their own videos
  if (session.user.role === 'CLIENT' && video.client?.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Clients cannot modify internal notes, driveLink, or assignedEditorId
  if (session.user.role === 'CLIENT') {
    if (internalNotes !== undefined || assignedEditorId !== undefined || deadline !== undefined || driveLink !== undefined || finalDeliveryUrl !== undefined) {
       return NextResponse.json({ error: 'Forbidden fields for client' }, { status: 403 })
    }
  }

  const updateData: any = {}
  if (status) updateData.status = status
  if (driveLink !== undefined) updateData.driveLink = driveLink
  if (finalDeliveryUrl !== undefined) updateData.finalDeliveryUrl = finalDeliveryUrl
  if (assignedEditorId !== undefined) updateData.assignedEditorId = assignedEditorId
  if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null
  if (internalNotes !== undefined) updateData.internalNotes = internalNotes

  // REVISION LOGIC
  if (status === 'REVISION' && video.status !== 'REVISION') {
    updateData.revisionCount = video.revisionCount + 1
  }

  // FINAL APPROVAL / DELIVERY LOGIC
  if (status === 'DELIVERED' && video.status !== 'DELIVERED') {
    updateData.deliveredAt = new Date()
    // Increment order delivered videos
    await db.order.update({
      where: { id: video.orderId },
      data: { deliveredVideos: { increment: 1 } }
    })
  }

  const updatedVideo = await db.video.update({
    where: { id },
    data: updateData
  })

  // ACTIVITY LOG
  if (status && status !== video.status) {
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        clientId: video.clientId,
        entityType: 'video',
        entityId: video.id,
        action: `video_status_changed_to_${status.toLowerCase()}`,
        metadata: { oldStatus: video.status, newStatus: status }
      }
    })
  }

  // NOTIFICATIONS
  if (status && status !== video.status) {
    if (status === 'CLIENT_REVIEW' && video.client?.userId) {
      await createNotification({
        userId: video.client.userId,
        title: 'Video ready for review',
        message: `Video #${video.id.slice(-6)} is ready for your review.`,
        type: 'VIDEO_REVIEW',
        linkUrl: '/portal',
        entityType: 'video',
        entityId: video.id
      })
    }
    if (status === 'REVISION' && video.assignedEditorId) {
      await createNotification({
        userId: video.assignedEditorId,
        title: 'Revision Requested',
        message: `Client requested a revision for video #${video.id.slice(-6)}.`,
        type: 'REVISION_REQUESTED',
        linkUrl: `/videos/${video.id}`,
        entityType: 'video',
        entityId: video.id
      })
    }
  }

  if (assignedEditorId && assignedEditorId !== video.assignedEditorId) {
    await createNotification({
      userId: assignedEditorId,
      title: 'New Video Assigned',
      message: `You have been assigned to edit video #${video.id.slice(-6)}.`,
      type: 'TASK_ASSIGNED',
      linkUrl: `/videos/${video.id}`,
      entityType: 'video',
      entityId: video.id
    })
  }

  return NextResponse.json(updatedVideo)
}
