import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { note } = await req.json()
  if (!note?.trim()) return NextResponse.json({ error: 'Note required' }, { status: 400 })

  const leadNote = await db.leadNote.create({
    data: {
      leadId:   params.id,
      authorId: session.user.id,
      note:     note.trim(),
    },
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json(leadNote, { status: 201 })
}
