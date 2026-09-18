import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus, UserCheck, MapPin, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const availabilityStyles = {
  AVAILABLE:   'bg-green-900/60 text-green-400',
  BOOKED:      'bg-amber-900/60 text-amber-400',
  UNAVAILABLE: 'bg-red-900/60 text-red-400',
  ON_HOLD:     'bg-gray-700/60 text-gray-400',
}

export default async function CreatorsPage() {
  const creators = await db.creator.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { shoots: true, videos: true } },
    },
  })

  return (
    <div>
      <Topbar title="Creators" subtitle="Creator database and availability management" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{creators.length} creators in database</p>
          <Link
            href="/creators/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            Add Creator
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((creator) => (
            <Link
              key={creator.id}
              href={`/creators/${creator.id}`}
              className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5 hover:border-[#333] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-500">
                    {creator.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{creator.name}</p>
                    <p className="text-xs text-gray-500">
                      {creator.gender} · {creator.ageGroup}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                  availabilityStyles[creator.availability]
                )}>
                  {creator.availability.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                {creator.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} />
                    {creator.location}
                  </div>
                )}
                {creator.languages.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Globe size={11} />
                    {creator.languages.join(', ')}
                  </div>
                )}
                {creator.niches.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {creator.niches.slice(0, 3).map((niche) => (
                      <span key={niche} className="rounded bg-[#222] px-2 py-0.5 text-xs text-gray-400">
                        {niche}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-[#222] flex items-center justify-between text-xs text-gray-500">
                <span>{creator._count.shoots} shoots</span>
                <span>{creator._count.videos} videos</span>
                {creator.ratePerVideo && (
                  <span className="text-amber-500 font-medium">
                    ₹{Number(creator.ratePerVideo).toLocaleString('en-IN')}/video
                  </span>
                )}
              </div>
            </Link>
          ))}

          {creators.length === 0 && (
            <div className="col-span-3 py-16 text-center">
              <UserCheck size={32} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-600">No creators yet. Add your first creator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
