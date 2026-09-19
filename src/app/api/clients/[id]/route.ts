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

export async function GET(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const client = await db.client.findUnique({
    where: { id },
    include: {
      assignedEmployee: { include: { user: { select: { name: true, email: true } } } },
      orders: { orderBy: { createdAt: 'desc' } },
      scripts: { orderBy: { createdAt: 'desc' }, include: { creator: { select: { name: true } } } },
      shoots: { orderBy: { scheduledDate: 'desc' } },
      videos: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      supportTickets: { orderBy: { createdAt: 'desc' } },
      activityLogs: { orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
      assets: { orderBy: { uploadedAt: 'desc' } },
    }
  })

  if (!client) return NextResponse.json({ message: 'Client not found' }, { status: 404 })

  return NextResponse.json(client)
}

export async function PATCH(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 }) }

  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors }, { status: 422 })
  }

  // Prevent email duplicate updates
  if (result.data.email) {
    const existing = await db.client.findUnique({ where: { email: result.data.email } })
    if (existing && existing.id !== id) {
      return NextResponse.json({ message: 'Email already used by another client' }, { status: 409 })
    }
  }

  const updatedClient = await db.client.update({
    where: { id },
    data: result.data,
  })

  // Log activity
  await db.activityLog.create({
    data: {
      userId: session.user.id,
      clientId: id,
      action: 'updated_client',
      entityType: 'client',
      entityId: id,
    }
  })

  return NextResponse.json(updatedClient)
}

export async function DELETE(req: NextRequest, { params }: any) {
  const session = await auth()
  if (!session || !['OWNER', 'ADMIN'].includes(session.user.role ?? '')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await db.client.delete({ where: { id } })

  return NextResponse.json({ message: 'Client deleted' })
}
