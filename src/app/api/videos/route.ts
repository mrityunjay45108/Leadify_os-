import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const videoSchema = z.object({
  clientId:        z.string(),
  orderId:         z.string(),
  scriptId:        z.string().optional(),
  creatorId:       z.string().optional(),
  shootId:         z.string().optional(),
  assignedEditorId:z.string().optional(),
  deadline:        z.string().datetime().optional(),
  videoFileUrl:    z.string().url().optional(),
  driveLink:       z.string().url().optional(),
  status:          z.enum([
    'SCRIPT_APPROVED', 'SHOOT_PENDING', 'RAW_FOOTAGE_RECEIVED',
    'VIDEO_EDITING', 'INTERNAL_QA', 'CLIENT_REVIEW',
    'REVISION', 'FINAL_APPROVED', 'DELIVERED',
  ]).default('SCRIPT_APPROVED'),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const orderId  = searchParams.get('orderId')

  const videos = await db.video.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(orderId  ? { orderId }  : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      client:      { select: { name: true } },
      creator:     { select: { name: true } },
      script:      { select: { videoNumber: true } },
      feedbackLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })
  return NextResponse.json(videos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = videoSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const { deadline, ...rest } = result.data

  const video = await db.video.create({
    data: { ...rest, deadline: deadline ? new Date(deadline) : undefined },
  })

  // Increment order assigned video count
  await db.order.update({
    where: { id: rest.orderId },
    data: { assignedVideos: { increment: 1 } },
  })

  return NextResponse.json(video, { status: 201 })
}
