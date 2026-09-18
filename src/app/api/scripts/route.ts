import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const scriptSchema = z.object({
  clientId:       z.string(),
  orderId:        z.string(),
  videoNumber:    z.number().int().min(1),
  writerId:       z.string().optional(),
  creatorId:      z.string().optional(),
  language:       z.string().optional(),
  scriptText:     z.string().optional(),
  referenceLinks: z.array(z.string().url()).default([]),
  deadline:       z.string().datetime().optional(),
  internalNotes:  z.string().optional(),
  status:         z.enum(['DRAFT', 'ASSIGNED', 'IN_REVIEW', 'SENT_TO_CLIENT', 'REVISION_REQUIRED', 'APPROVED', 'READY_FOR_SHOOT']).default('DRAFT'),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const status   = searchParams.get('status')

  const scripts = await db.script.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(status   ? { status: status as never } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      client:  { select: { name: true } },
      creator: { select: { name: true } },
      order:   { select: { packageName: true } },
    },
  })

  return NextResponse.json(scripts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = scriptSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { deadline, ...rest } = result.data

  const script = await db.script.create({
    data: {
      ...rest,
      deadline: deadline ? new Date(deadline) : undefined,
    },
  })

  await db.activityLog.create({
    data: {
      userId:     session.user.id,
      clientId:   result.data.clientId,
      action:     'created_script',
      entityType: 'script',
      entityId:   script.id,
    },
  })

  return NextResponse.json(script, { status: 201 })
}
