import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const creatorSchema = z.object({
  name:         z.string().min(1),
  photo:        z.string().url().optional(),
  gender:       z.string().optional(),
  ageGroup:     z.string().optional(),
  languages:    z.array(z.string()).default([]),
  location:     z.string().optional(),
  niches:       z.array(z.string()).default([]),
  demographics: z.string().optional(),
  email:        z.string().email().optional(),
  phone:        z.string().optional(),
  instagramUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  ratePerVideo: z.number().positive().optional(),
  bankName:     z.string().optional(),
  accountNumber:z.string().optional(),
  ifscCode:     z.string().optional(),
  upiId:        z.string().optional(),
  availability: z.enum(['AVAILABLE', 'BOOKED', 'UNAVAILABLE', 'ON_HOLD']).default('AVAILABLE'),
  notes:        z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const creators = await db.creator.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { shoots: true, videos: true } } },
  })
  return NextResponse.json(creators)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = creatorSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ message: 'Validation failed', errors: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const creator = await db.creator.create({ data: result.data })
  return NextResponse.json(creator, { status: 201 })
}
