// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id } = await params;
  const { feedback } = await req.json()
  
  if (!feedback) return NextResponse.json({ error: 'Feedback required' }, { status: 400 })

  const video = await db.video.findUnique({ 
    where: { id },
    include: { client: { select: { userId: true } } }
  })
  
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role === 'CLIENT' && video.client?.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const log = await db.videoFeedback.create({
    data: {
      videoId: id,
      feedback,
      authorType: session.user.role === 'CLIENT' ? 'CLIENT' : 'INTERNAL',
      authorId: session.user.id
    }
  })

  // Create activity log
  await db.activityLog.create({
    data: {
      userId: session.user.id,
      clientId: video.clientId,
      entityType: 'video',
      entityId: video.id,
      action: 'client_feedback_added',
      metadata: { feedbackPreview: feedback.slice(0, 50) }
    }
  })

  if (session.user.role === 'CLIENT' && video.assignedEditorId) {
    const { createNotification } = await import('@/lib/notifications')
    await createNotification({
      userId: video.assignedEditorId,
      title: 'New Client Feedback',
      message: `Client posted feedback on video #${video.id.slice(-6)}`,
      type: 'VIDEO_REVIEW',
      linkUrl: `/videos/${video.id}`,
      entityType: 'video',
      entityId: video.id
    })
  }

  return NextResponse.json(log)
}
