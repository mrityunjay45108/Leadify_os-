import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const paymentSchema = z.object({
  clientId:       z.string(),
  orderId:        z.string(),
  invoiceAmount:  z.number().positive(),
  amountReceived: z.number().min(0).default(0),
  paymentDate:    z.string().datetime().optional(),
  method:         z.string().optional(),
  transactionRef: z.string().optional(),
  notes:          z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session || !['OWNER', 'ADMIN'].includes(session.user.role ?? '')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const payments = await db.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true } },
      order:  { select: { packageName: true } },
    },
  })
  return NextResponse.json(payments)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['OWNER', 'ADMIN'].includes(session.user.role ?? '')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const result = paymentSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const { paymentDate, invoiceAmount, amountReceived, ...rest } = result.data
  const pendingBalance = invoiceAmount - amountReceived

  let status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = 'UNPAID'
  if (amountReceived >= invoiceAmount) status = 'PAID'
  else if (amountReceived > 0) status = 'PARTIALLY_PAID'

  const payment = await db.payment.create({
    data: {
      ...rest,
      invoiceAmount,
      amountReceived,
      pendingBalance,
      status,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
    },
  })

  // Update order balance
  await db.order.update({
    where: { id: result.data.orderId },
    data: {
      amountReceived:    { increment: amountReceived },
      outstandingBalance: { decrement: amountReceived },
    },
  })

  await db.activityLog.create({
    data: {
      userId:     session.user.id,
      clientId:   result.data.clientId,
      action:     'payment_received',
      entityType: 'payment',
      entityId:   payment.id,
      metadata:   { amount: amountReceived },
    },
  })

  return NextResponse.json(payment, { status: 201 })
}
