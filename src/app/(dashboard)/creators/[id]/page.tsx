import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, MapPin, Globe, ExternalLink, Phone, Mail } from 'lucide-react'

const availabilityColors: Record<string, string> = {
  AVAILABLE:   'bg-green-900/60 text-green-400',
  BOOKED:      'bg-amber-900/60 text-amber-400',
  UNAVAILABLE: 'bg-red-900/60 text-red-400',
  ON_HOLD:     'bg-gray-700/60 text-gray-400',
}

export default async function CreatorDetailPage({ params }: any) {
  const { id } = await params

  const creator = await db.creator.findUnique({
    where: { id },
    include: {
      shoots: {
        orderBy: { scheduledDate: 'desc' },
        take: 10,
        include: { client: { select: { name: true } } },
      },
      videos: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { client: { select: { name: true } } },
      },
      creatorPayouts: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: { select: { shoots: true, videos: true } },
    },
  })

  if (!creator) notFound()

  const totalEarned = creator.creatorPayouts.reduce((s: any, p: any) => s + Number(p.totalPayout), 0)
  const deliveredCount = creator.videos.filter((v: any) => v.status === 'DELIVERED').length

  return (
    <div>
      <Topbar title={creator.name} subtitle="Creator profile" />
      <div className="p-6 space-y-6">
        <Link href="/creators" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to creators
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-2xl font-bold text-amber-500 mb-3">
                  {creator.name.charAt(0)}
                </div>
                <h2 className="text-lg font-semibold text-white">{creator.name}</h2>
                <p className="text-xs text-gray-500">{creator.gender} · {creator.ageGroup}</p>
                <span className={cn('mt-2 rounded-md px-2 py-0.5 text-xs font-medium', availabilityColors[creator.availability])}>
                  {creator.availability.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                {creator.location && (
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <MapPin size={13} />{creator.location}
                  </div>
                )}
                {creator.email && (
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <Mail size={13} />{creator.email}
                  </div>
                )}
                {creator.phone && (
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <Phone size={13} />{creator.phone}
                  </div>
                )}
                {creator.instagramUrl && (
                  <a href={creator.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-amber-500 hover:text-amber-400">
                    <ExternalLink size={13} />Instagram
                  </a>
                )}
              </div>

              {creator.niches.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {creator.niches.map((n) => (
                    <span key={n} className="rounded bg-[#222] px-2 py-0.5 text-xs text-gray-400">{n}</span>
                  ))}
                </div>
              )}

              {creator.languages.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Globe size={11} />
                  {creator.languages.join(', ')}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Shoots',    value: creator._count.shoots },
                { label: 'Videos',    value: creator._count.videos },
                { label: 'Delivered', value: deliveredCount },
                { label: 'Earned',    value: formatCurrency(totalEarned) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-3 text-center">
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Rate info */}
            {creator.ratePerVideo && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                <p className="text-xs text-amber-500/70 mb-1">Rate per Video</p>
                <p className="text-2xl font-bold text-amber-500">
                  {formatCurrency(Number(creator.ratePerVideo))}
                </p>
              </div>
            )}

            {/* Bank info */}
            {creator.bankName && (
              <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4 space-y-1.5 text-xs">
                <p className="text-gray-500 font-medium uppercase tracking-wider mb-2">Payment Details</p>
                {creator.bankName && <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="text-gray-300">{creator.bankName}</span></div>}
                {creator.accountNumber && <div className="flex justify-between"><span className="text-gray-500">Account</span><span className="text-gray-300">••••{creator.accountNumber.slice(-4)}</span></div>}
                {creator.ifscCode && <div className="flex justify-between"><span className="text-gray-500">IFSC</span><span className="text-gray-300">{creator.ifscCode}</span></div>}
                {creator.upiId && <div className="flex justify-between"><span className="text-gray-500">UPI</span><span className="text-gray-300">{creator.upiId}</span></div>}
              </div>
            )}
          </div>

          {/* Shoots + Videos + Payouts */}
          <div className="lg:col-span-2 space-y-5">
            {/* Recent Shoots */}
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Shoots ({creator.shoots.length})</h3>
              {creator.shoots.length === 0 ? (
                <p className="text-sm text-gray-600">No shoots yet</p>
              ) : (
                <div className="space-y-2">
                  {creator.shoots.map((shoot) => (
                    <div key={shoot.id} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                      <div>
                        <p className="text-sm text-white">{shoot.client.name}</p>
                        <p className="text-xs text-gray-500">{shoot.location ?? '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{formatDate(shoot.scheduledDate)}</p>
                        <p className={cn('text-[10px] mt-0.5', {
                          'text-green-400':  shoot.status === 'COMPLETED',
                          'text-amber-400':  shoot.status === 'CONFIRMED',
                          'text-blue-400':   shoot.status === 'SCHEDULED',
                          'text-red-400':    shoot.status === 'CANCELLED',
                          'text-orange-400': shoot.status === 'RESHOOT_REQUIRED',
                        })}>
                          {shoot.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payouts */}
            <div className="rounded-xl border border-[#222] bg-[#1a1a1a] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Payout History</h3>
              {creator.creatorPayouts.length === 0 ? (
                <p className="text-sm text-gray-600">No payouts yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-gray-500 border-b border-[#222]">
                      <tr>
                        <th className="py-2 font-medium">Date</th>
                        <th className="py-2 font-medium">Videos</th>
                        <th className="py-2 font-medium">Rate</th>
                        <th className="py-2 font-medium">Total</th>
                        <th className="py-2 font-medium">Status</th>
                        <th className="py-2 font-medium">Paid On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                    {creator.creatorPayouts.map((payout: any) => (
                      <tr key={payout.id}>
                        <td className="py-2 text-gray-400">{formatDate(payout.createdAt)}</td>
                        <td className="py-2 text-gray-300">{payout.videoCount}</td>
                        <td className="py-2 text-gray-400">{formatCurrency(Number(payout.ratePerVideo))}</td>
                        <td className="py-2 text-purple-400 font-medium">{formatCurrency(Number(payout.totalPayout))}</td>
                        <td className="py-2">
                          <span className={cn(
                            'text-[10px] font-bold uppercase',
                            {
                              'text-green-400':  payout.status === 'PAID',
                              'text-blue-400':   payout.status === 'APPROVED',
                              'text-amber-400':  payout.status === 'PENDING',
                            }
                          )}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500">
                          {payout.paymentDate ? formatDate(payout.paymentDate) : '—'}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
