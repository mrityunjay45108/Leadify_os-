'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Video, AlertTriangle } from 'lucide-react'
import type { Video as VideoModel, Client, Creator, Script } from '@prisma/client'

type VideoWithRelations = VideoModel & {
  client:  Pick<Client, 'name'>
  creator: Pick<Creator, 'name'> | null
  script:  Pick<Script, 'videoNumber'> | null
  _count:  { feedbackLogs: number }
}

const stages = [
  { key: 'SCRIPT_APPROVED',     label: 'Script Approved',  color: 'border-purple-500/40 bg-purple-500/5' },
  { key: 'SHOOT_PENDING',       label: 'Shoot Pending',    color: 'border-blue-500/40 bg-blue-500/5' },
  { key: 'RAW_FOOTAGE_RECEIVED',label: 'Raw Footage',      color: 'border-indigo-500/40 bg-indigo-500/5' },
  { key: 'VIDEO_EDITING',       label: 'Editing',          color: 'border-cyan-500/40 bg-cyan-500/5' },
  { key: 'INTERNAL_QA',         label: 'Internal QA',      color: 'border-teal-500/40 bg-teal-500/5' },
  { key: 'CLIENT_REVIEW',       label: 'Client Review',    color: 'border-amber-500/40 bg-amber-500/5' },
  { key: 'REVISION',            label: 'Revision',         color: 'border-orange-500/40 bg-orange-500/5' },
  { key: 'FINAL_APPROVED',      label: 'Final Approved',   color: 'border-green-500/40 bg-green-500/5' },
  { key: 'DELIVERED',           label: 'Delivered',        color: 'border-emerald-600/40 bg-emerald-600/5' },
]

const stageLabelColors: Record<string, string> = {
  SCRIPT_APPROVED:     'text-purple-400',
  SHOOT_PENDING:       'text-blue-400',
  RAW_FOOTAGE_RECEIVED:'text-indigo-400',
  VIDEO_EDITING:       'text-cyan-400',
  INTERNAL_QA:         'text-teal-400',
  CLIENT_REVIEW:       'text-amber-400',
  REVISION:            'text-orange-400',
  FINAL_APPROVED:      'text-green-400',
  DELIVERED:           'text-emerald-400',
}

export function VideoPipeline({ videos }: { videos: VideoWithRelations[] }) {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')

  const byStage = stages.map((stage) => ({
    ...stage,
    videos: videos.filter((v) => v.status === stage.key),
  }))

  if (view === 'table') {
    return (
      <div>
        <ViewToggle view={view} setView={setView} />
        <div className="rounded-xl border border-[#222] bg-[#1a1a1a] overflow-hidden mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {videos.map((video) => {
                const isOverdue = video.deadline && new Date(video.deadline) < new Date() && video.status !== 'DELIVERED'
                return (
                  <tr key={video.id} className="hover:bg-[#1e1e1e] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">
                        {video.script ? `Video #${video.script.videoNumber}` : video.id.slice(0, 8)}
                      </p>
                      {video.creator && <p className="text-xs text-gray-500">{video.creator.name}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">{video.client.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-xs font-medium', stageLabelColors[video.status])}>
                        {video.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {video.deadline ? (
                        <span className={cn('text-xs', isOverdue ? 'text-red-400 font-medium' : 'text-gray-500')}>
                          {isOverdue && <AlertTriangle size={11} className="inline mr-1" />}
                          {formatDate(video.deadline)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{video._count.feedbackLogs}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Kanban view
  return (
    <div>
      <ViewToggle view={view} setView={setView} />
      <div className="flex gap-4 overflow-x-auto pb-4 mt-4">
        {byStage.map((stage) => (
          <div key={stage.key} className="flex-shrink-0 w-64">
            <div className={cn('rounded-t-xl border border-b-0 px-4 py-3', stage.color)}>
              <div className="flex items-center justify-between">
                <span className={cn('text-xs font-semibold', stageLabelColors[stage.key])}>
                  {stage.label}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111] text-xs text-gray-400">
                  {stage.videos.length}
                </span>
              </div>
            </div>
            <div className={cn('rounded-b-xl border border-t-0 min-h-32 p-2 space-y-2', stage.color)}>
              {stage.videos.map((video) => {
                const isOverdue = video.deadline && new Date(video.deadline) < new Date() && video.status !== 'DELIVERED'
                return (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
                    className="block rounded-lg border border-[#2a2a2a] bg-[#111] p-3 hover:border-[#3a3a3a] transition-all"
                  >
                    <p className="text-xs font-medium text-white mb-1">
                      {video.script ? `Video #${video.script.videoNumber}` : 'Unlinked video'}
                    </p>
                    <p className="text-xs text-gray-500">{video.client.name}</p>
                    {video.deadline && (
                      <p className={cn('text-[10px] mt-1.5', isOverdue ? 'text-red-400' : 'text-gray-600')}>
                        {isOverdue ? '⚠ Overdue · ' : ''}{formatDate(video.deadline)}
                      </p>
                    )}
                    {video._count.feedbackLogs > 0 && (
                      <p className="text-[10px] text-amber-500 mt-1">
                        {video._count.feedbackLogs} feedback notes
                      </p>
                    )}
                  </Link>
                )
              })}
              {stage.videos.length === 0 && (
                <div className="flex h-16 items-center justify-center">
                  <Video size={16} className="text-gray-700" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ViewToggle({ view, setView }: { view: string; setView: (v: 'kanban' | 'table') => void }) {
  return (
    <div className="flex items-center gap-2">
      {(['kanban', 'table'] as const).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize',
            view === v
              ? 'bg-amber-500/10 text-amber-500'
              : 'text-gray-500 hover:text-white'
          )}
        >
          {v}
        </button>
      ))}
    </div>
  )
}
