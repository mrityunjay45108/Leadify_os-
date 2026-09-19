import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lead = await db.lead.findUnique({
    where: { id: params.id },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      notes:    { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'CLIENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  const lead = await db.lead.update({
    where: { id: params.id },
    data:  {
      ...body,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
      budget:       body.budget ? Number(body.budget) : undefined,
    },
  })

  await db.activityLog.create({
    data: {
      userId:    session.user.id,
      leadId:    lead.id,
      action:    'updated_lead',
      entityType: 'lead',
      entityId:  lead.id,
    },
  })

  return NextResponse.json(lead)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['OWNER', 'ADMIN'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.lead.update({
    where: { id: params.id },
    data:  { isArchived: true },
  })

  return NextResponse.json({ ok: true })
}
