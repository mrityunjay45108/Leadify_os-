import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const shootSchema = z.object({
  clientId:         z.string(),
  orderId:          z.string(),
  scheduledDate:    z.string().datetime(),
  location:         z.string().optional(),
  creatorId:        z.string().optional(),
  cameraman:        z.string().optional(),
  shootManagerId:   z.string().optional(),
  shootingAssistant:z.string().optional(),
  specialNotes:     z.string().optional(),
  status:           z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESHOOT_REQUIRED']).default('SCHEDULED'),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const shoots = await db.shoot.findMany({
    orderBy: { scheduledDate: 'asc' },
    include: {
      client:       { select: { name: true } },
      creator:      { select: { name: true } },
      shootManager: { include: { user: { select: { name: true } } } },
      order:        { select: { packageName: true } },
    },
  })
  return NextResponse.json(shoots)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = shootSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const { scheduledDate, ...rest } = result.data
  const shoot = await db.shoot.create({
    data: { ...rest, scheduledDate: new Date(scheduledDate) },
  })

  await db.activityLog.create({
    data: {
      userId:     session.user.id,
      clientId:   result.data.clientId,
      action:     'shoot_scheduled',
      entityType: 'shoot',
      entityId:   shoot.id,
    },
  })

  // Check creator availability and set as booked
  if (rest.creatorId) {
    await db.creator.update({
      where: { id: rest.creatorId },
      data:  { availability: 'BOOKED' },
    })
  }

  return NextResponse.json(shoot, { status: 201 })
}
