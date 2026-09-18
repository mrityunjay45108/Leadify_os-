import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const createClientSchema = z.object({
  name:        z.string().min(2),
  // CRITICAL FIX: Accept both field names for backwards compat with any legacy payloads.
  // The DB column is company_name, Prisma field is companyName. We normalize here.
  companyName: z.string().optional(),
  company:     z.string().optional(),
  email:       z.string().email(),
  phone:       z.string().optional(),
  whatsapp:    z.string().optional(),
  brandName:   z.string().optional(),
  industry:    z.string().optional(),
  gstNumber:   z.string().optional(),
  source:      z.string().optional(),
  status:      z.enum(['LEAD', 'NEW', 'ONBOARDING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'INACTIVE']).default('NEW'),
  notes:       z.string().optional(),
  assignedEmployeeId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const clients = await db.client.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      assignedEmployee: { include: { user: { select: { name: true } } } },
      _count: { select: { orders: true, videos: true } },
    },
  })

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const result = createClientSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { company, companyName, ...rest } = result.data

  // Normalize: if legacy "company" field sent, map it to companyName
  const resolvedCompanyName = companyName ?? company ?? undefined

  // Check for duplicate email
  const existing = await db.client.findUnique({ where: { email: rest.email } })
  if (existing) {
    return NextResponse.json({ message: 'A client with this email already exists' }, { status: 409 })
  }

  const client = await db.client.create({
    data: {
      ...rest,
      companyName: resolvedCompanyName,
    },
  })

  // Log activity
  await db.activityLog.create({
    data: {
      userId:     session.user.id,
      clientId:   client.id,
      action:     'created_client',
      entityType: 'client',
      entityId:   client.id,
    },
  })

  return NextResponse.json(client, { status: 201 })
}
