import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const orderSchema = z.object({
  clientId:       z.string(),
  packageName:    z.string().min(1),
  videoCount:     z.number().int().min(1),
  pricing:        z.number().positive(),
  gstAmount:      z.number().optional(),
  totalInvoice:   z.number().positive(),
  amountReceived: z.number().default(0),
  startDate:      z.string().datetime().optional(),
  dueDate:        z.string().datetime().optional(),
  assignedTeam:   z.string().optional(),
  notes:          z.string().optional(),
  status:         z.enum(['NEW', 'ONBOARDING', 'IN_PRODUCTION', 'PARTIALLY_DELIVERED', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).default('NEW'),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  const orders = await db.order.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, companyName: true } },
      _count: { select: { videos: true, scripts: true } },
    },
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = orderSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { startDate, dueDate, amountReceived, pricing, totalInvoice, gstAmount, ...rest } = result.data

  const outstandingBalance = totalInvoice - amountReceived

  const order = await db.order.create({
    data: {
      ...rest,
      pricing:          pricing,
      gstAmount:        gstAmount ?? 0,
      totalInvoice:     totalInvoice,
      amountReceived:   amountReceived,
      outstandingBalance,
      startDate:        startDate ? new Date(startDate) : undefined,
      dueDate:          dueDate   ? new Date(dueDate)   : undefined,
    },
  })

  await db.activityLog.create({
    data: {
      userId:     session.user.id,
      clientId:   result.data.clientId,
      action:     'created_order',
      entityType: 'order',
      entityId:   order.id,
    },
  })

  return NextResponse.json(order, { status: 201 })
}
