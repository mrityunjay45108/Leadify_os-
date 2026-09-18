import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const payoutSchema = z.object({
  creatorId:    z.string(),
  orderId:      z.string().optional(),
  videoCount:   z.number().int().min(0).default(0),
  ratePerVideo: z.number().positive(),
  totalPayout:  z.number().positive(),
  paymentDate:  z.string().datetime().optional(),
  reference:    z.string().optional(),
  status:       z.enum(['PENDING', 'APPROVED', 'PAID']).default('PENDING'),
})

export async function GET() {
  const session = await auth()
  if (!session || !['OWNER', 'ADMIN'].includes(session.user.role ?? '')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const payouts = await db.creatorPayout.findMany({
    orderBy: { createdAt: 'desc' },
    include: { creator: { select: { name: true } } },
  })
  return NextResponse.json(payouts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['OWNER', 'ADMIN'].includes(session.user.role ?? '')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const result = payoutSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const { paymentDate, ...rest } = result.data
  const payout = await db.creatorPayout.create({
    data: { ...rest, paymentDate: paymentDate ? new Date(paymentDate) : undefined },
  })

  return NextResponse.json(payout, { status: 201 })
}
