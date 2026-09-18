import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  name:               z.string().min(2).optional(),
  companyName:        z.string().optional(),
  email:              z.string().email().optional(),
  phone:              z.string().optional(),
  whatsapp:           z.string().optional(),
  brandName:          z.string().optional(),
  industry:           z.string().optional(),
  gstNumber:          z.string().optional(),
  source:             z.string().optional(),
  status:             z.enum(['LEAD', 'NEW', 'ONBOARDING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'INACTIVE']).optional(),
  notes:              z.string().optional(),
  assignedEmployeeId: z.string().optional(),
})

interface RouteParams {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const client = await db.client.findUnique({
    where: { id: params.id },
    include: {
      assignedEmployee: { include: { user: { select: { name: true, email: true } } } },
      orders: { orderBy: { createdAt: 'desc' } },
      scripts: { orderBy: { createdAt: 'desc' }, take: 5 },
      shoots:  { orderBy: { scheduledDate: 'desc' }, take: 5 },
      videos:  { orderBy: { createdAt: 'desc' }, take: 10 },
      payments: true,
      supportTickets: { orderBy: { createdAt: 'desc' } },
      assets: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { name: true } } },
      },
    },
  })

  if (!client) return NextResponse.json({ message: 'Client not found' }, { status: 404 })

  return NextResponse.json(client)
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const client = await db.client.update({
    where: { id: params.id },
    data: result.data,
  })

  await db.activityLog.create({
    data: {
      userId:     session.user.id,
      clientId:   client.id,
      action:     'updated_client',
      entityType: 'client',
      entityId:   client.id,
    },
  })

  return NextResponse.json(client)
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!['OWNER', 'ADMIN'].includes(session.user.role ?? '')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await db.client.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Client deleted' })
}
