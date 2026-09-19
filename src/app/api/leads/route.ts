import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const LeadSchema = z.object({
  name:         z.string().min(1),
  company:      z.string().optional().nullable(),
  email:        z.string().email().optional().nullable(),
  phone:        z.string().optional().nullable(),
  whatsapp:     z.string().optional().nullable(),
  source:       z.enum(['INSTAGRAM','REFERRAL','COLD_OUTREACH','WEBSITE','LINKEDIN','WHATSAPP','ORGANIC','OTHER']).default('OTHER'),
  status:       z.enum(['NEW','CONTACTED','QUALIFIED','PROPOSAL_SENT','NEGOTIATION','CONVERTED','LOST']).default('NEW'),
  requirements: z.string().optional().nullable(),
  budget:       z.number().optional().nullable(),
  assigneeId:   z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const assigneeId = searchParams.get('assigneeId')

  const leads = await db.lead.findMany({
    where: {
      isArchived: false,
      ...(status     && { status: status as any }),
      ...(assigneeId && { assigneeId }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assignee: { select: { id: true, name: true } },
      _count:   { select: { notes: true } },
    },
  })

  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'CLIENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = LeadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { followUpDate, budget, ...rest } = parsed.data

  const lead = await db.lead.create({
    data: {
      ...rest,
      budget:      budget ?? undefined,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    },
  })

  // Activity log
  await db.activityLog.create({
    data: {
      userId:    session.user.id,
      leadId:    lead.id,
      action:    'created_lead',
      entityType: 'lead',
      entityId:  lead.id,
    },
  })

  return NextResponse.json(lead, { status: 201 })
}
