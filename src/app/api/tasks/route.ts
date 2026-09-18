import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const taskSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status:      z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  assigneeId:  z.string().optional(),
  dueDate:     z.string().datetime().optional(),
  relatedType: z.string().optional(),
  relatedId:   z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const tasks = await db.task.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      assignee:  { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = taskSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const { dueDate, ...rest } = result.data
  const task = await db.task.create({
    data: {
      ...rest,
      dueDate:     dueDate ? new Date(dueDate) : undefined,
      createdById: session.user.id,
    },
  })
  return NextResponse.json(task, { status: 201 })
}
