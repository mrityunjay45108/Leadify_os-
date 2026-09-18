'use client'

import { formatDate, cn } from '@/lib/utils'
import Link from 'next/link'
import { MapPin, User, Camera } from 'lucide-react'
import type { Shoot, Client, Creator, Order } from '@prisma/client'

type ShootWithRelations = Shoot & {
  client:  Pick<Client, 'name'>
  creator: Pick<Creator, 'name'> | null
  order:   Pick<Order, 'packageName'>
}

const statusColors: Record<string, string> = {
  SCHEDULED:        'bg-blue-900/60 text-blue-400',
  CONFIRMED:        'bg-green-900/60 text-green-400',
  IN_PROGRESS:      'bg-amber-900/60 text-amber-400',
  COMPLETED:        'bg-teal-900/60 text-teal-400',
  CANCELLED:        'bg-red-900/60 text-red-400',
  RESHOOT_REQUIRED: 'bg-orange-900/60 text-orange-400',
}

export function ShootsCalendar({ shoots }: { shoots: ShootWithRelations[] }) {
  // Group shoots by date
  const grouped = shoots.reduce<Record<string, ShootWithRelations[]>>((acc, shoot) => {
    const dateKey = new Date(shoot.scheduledDate).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(shoot)
    return acc
  }, {})

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="rounded-xl border border-[#222] bg-[#1a1a1a] py-16 text-center">
        <Camera size={32} className="mx-auto text-gray-700 mb-3" />
        <p className="text-gray-600">No upcoming shoots scheduled</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateStr, dayShoot]) => {
        const date = new Date(dateStr)
        const isToday = date.toDateString() === new Date().toDateString()

        return (
          <div key={dateStr}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'flex h-8 w-8 flex-col items-center justify-center rounded-lg text-xs font-bold',
                isToday ? 'bg-amber-500 text-black' : 'bg-[#222] text-gray-400'
              )}>
                <span className="leading-none">{date.getDate()}</span>
              </div>
              <div>
                <p className={cn('text-sm font-medium', isToday ? 'text-amber-500' : 'text-white')}>
                  {isToday ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'long' })}
                </p>
                <p className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-11">
              {dayShoot.map((shoot) => (
                <Link
                  key={shoot.id}
                  href={`/shoots/${shoot.id}`}
                  className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 hover:border-[#333] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-white text-sm">{shoot.client.name}</p>
                    <span className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                      statusColors[shoot.status]
                    )}>
                      {shoot.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{shoot.order.packageName}</p>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    {shoot.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} />
                        {shoot.location}
                      </div>
                    )}
                    {shoot.creator && (
                      <div className="flex items-center gap-1.5">
                        <User size={11} />
                        {shoot.creator.name}
                      </div>
                    )}
                    {shoot.cameraman && (
                      <div className="flex items-center gap-1.5">
                        <Camera size={11} />
                        {shoot.cameraman}
                      </div>
                    )}
                  </div>
                  {/* Checklist progress */}
                  <div className="mt-3 pt-2 border-t border-[#222]">
                    {(() => {
                      const checks = [
                        shoot.scriptApproved, shoot.creatorConfirmed,
                        shoot.locationCleared, shoot.productReceived, shoot.teamBriefed,
                      ]
                      const done = checks.filter(Boolean).length
                      return (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Pre-shoot checklist</span>
                          <span className={done === checks.length ? 'text-green-400' : 'text-amber-400'}>
                            {done}/{checks.length}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
