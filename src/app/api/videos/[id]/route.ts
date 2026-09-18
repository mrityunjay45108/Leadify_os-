import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

interface RouteParams { params: { id: string } }

const statusSchema = z.object({
  status: z.enum([
    'SCRIPT_APPROVED', 'SHOOT_PENDING', 'RAW_FOOTAGE_RECEIVED',
    'VIDEO_EDITING', 'INTERNAL_QA', 'CLIENT_REVIEW',
    'REVISION', 'FINAL_APPROVED', 'DELIVERED',
  ]),
  finalDeliveryUrl: z.string().url().optional(),
  driveLink:        z.string().url().optional(),
})

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const video = await db.video.findUnique({
    where: { id: params.id },
    include: {
      client:      { select: { name: true, email: true } },
      creator:     { select: { name: true } },
      script:      true,
      shoot:       true,
      feedbackLogs: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!video) return NextResponse.json({ message: 'Video not found' }, { status: 404 })
  return NextResponse.json(video)
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = statusSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ message: 'Validation failed' }, { status: 422 })
  }

  const existingVideo = await db.video.findUnique({ where: { id: params.id } })
  if (!existingVideo) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  const updateData: Record<string, unknown> = { ...result.data }

  // When video is delivered, update order counters and set delivery timestamp
  if (result.data.status === 'DELIVERED' && existingVideo.status !== 'DELIVERED') {
    updateData.deliveredAt = new Date()
    await db.order.update({
      where: { id: existingVideo.orderId },
      data: {
        deliveredVideos: { increment: 1 },
        completedVideos: { increment: 1 },
      },
    })
    await db.activityLog.create({
      data: {
        userId:     session.user.id,
        clientId:   existingVideo.clientId,
        action:     'delivered_video',
        entityType: 'video',
        entityId:   params.id,
      },
    })
  }

  // When revision is requested, increment revision counter
  if (result.data.status === 'REVISION' && existingVideo.status === 'CLIENT_REVIEW') {
    await db.video.update({
      where: { id: params.id },
      data:  { revisionCount: { increment: 1 } },
    })
  }

  const video = await db.video.update({
    where: { id: params.id },
    data:  updateData,
  })

  return NextResponse.json(video)
}
