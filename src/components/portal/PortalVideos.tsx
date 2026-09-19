'use client'

import { useState } from 'react'
import { Video, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, formatDate } from '@/lib/utils'

export function PortalVideos({ videos }: { videos: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [feedbackModal, setFeedbackModal] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const handleAction = async (id: string, action: 'approve' | 'revision') => {
    if (action === 'revision' && !feedbackModal) {
      setFeedbackModal(id)
      return
    }

    setLoading(id)
    try {
      // 1. Submit feedback if it's a revision request
      if (action === 'revision') {
        await fetch(`/api/videos/${id}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback })
        })
      }

      // 2. Change video status (which handles revision counts logic in API)
      await fetch(`/api/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'FINAL_APPROVED' : 'REVISION'
        })
      })

      if (action === 'revision') {
        setFeedbackModal(null)
        setFeedback('')
      }
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  if (videos.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Video size={15} className="text-amber-500" />
        Videos for Review & Delivery
      </h3>
      <div className="space-y-3">
        {videos.map((video) => (
          <div key={video.id} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-white">Video {video.script ? `#${video.script.videoNumber}` : video.id.slice(-6)}</p>
                {video.revisionCount > 0 && <p className="text-[10px] text-orange-400 mt-1">Revision {video.revisionCount}</p>}
                {video.deadline && <p className="text-[10px] text-gray-500 mt-0.5">Due: {formatDate(video.deadline)}</p>}
              </div>
              <span className={cn(
                'rounded-md px-2 py-0.5 text-xs font-medium',
                video.status === 'DELIVERED' ? 'bg-emerald-900/60 text-emerald-400' :
                video.status === 'FINAL_APPROVED' ? 'bg-green-900/60 text-green-400' :
                video.status === 'REVISION' ? 'bg-orange-900/60 text-orange-400' :
                'bg-amber-900/60 text-amber-400'
              )}>
                {video.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {/* Working/Review Link */}
              {video.driveLink && video.status !== 'DELIVERED' && (
                <a href={video.driveLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400">
                  <ExternalLink size={13} /> View Draft Video
                </a>
              )}
              {/* Final Delivery Link */}
              {video.finalDeliveryUrl && video.status === 'DELIVERED' && (
                <a href={video.finalDeliveryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-400 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 w-max">
                  <ExternalLink size={13} /> Download Final Video
                </a>
              )}
            </div>

            {video.feedbackLogs?.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Feedback History</p>
                {video.feedbackLogs.map((f: any) => (
                  <div key={f.id} className="rounded-lg bg-[#111] border border-[#222] p-2.5 text-xs text-gray-300">
                    <p>{f.feedback}</p>
                    <p className="text-[9px] text-gray-500 mt-1">{formatDate(f.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}

            {video.status === 'CLIENT_REVIEW' && (
              <div className="mt-4 border-t border-[#222] pt-4">
                {feedbackModal === video.id ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <textarea 
                      placeholder="Please detail your requested video revisions (timestamps are helpful)..."
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none min-h-[100px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setFeedbackModal(null)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
                      <button 
                        onClick={() => handleAction(video.id, 'revision')}
                        disabled={loading === video.id || !feedback.trim()}
                        className="px-3 py-1.5 text-xs bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50"
                      >
                        {loading === video.id ? 'Submitting...' : 'Submit Video Revision'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(video.id, 'approve')}
                      disabled={loading === video.id}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      <CheckCircle size={13} /> {loading === video.id ? 'Approving...' : 'Approve Final Video'}
                    </button>
                    <button 
                      onClick={() => handleAction(video.id, 'revision')}
                      className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      <Clock size={13} /> Request Revision
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
