import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subject, message } = await req.json()
  
  if (!subject || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const client = await db.client.findUnique({
    where: { userId: session.user.id }
  })

  if (!client) return NextResponse.json({ error: 'No client profile found' }, { status: 404 })

  const ticket = await db.supportTicket.create({
    data: {
      clientId: client.id,
      subject,
      description: message,
      status: 'OPEN',
    }
  })

  return NextResponse.json(ticket)
}
