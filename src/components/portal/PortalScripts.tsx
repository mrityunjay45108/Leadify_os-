'use client'

import { useState } from 'react'
import { FileText, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function PortalScripts({ scripts }: { scripts: any[] }) {
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
      await fetch(`/api/scripts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'APPROVED' : 'REVISION_REQUIRED',
          ...(action === 'revision' && { clientFeedback: feedback })
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

  if (scripts.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <FileText size={15} className="text-amber-500" />
        Scripts Awaiting Review
      </h3>
      <div className="space-y-3">
        {scripts.map((script) => (
          <div key={script.id} className="rounded-xl border border-[#222] bg-[#1a1a1a] p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-white">Video #{script.videoNumber}</p>
                {script.creator && <p className="text-xs text-gray-500">Creator: {script.creator.name}</p>}
                {script.revisionCount > 0 && <p className="text-[10px] text-orange-400 mt-1">Revision {script.revisionCount}</p>}
              </div>
              <span className={cn(
                'rounded-md px-2 py-0.5 text-xs font-medium',
                script.status === 'APPROVED' ? 'bg-green-900/60 text-green-400' :
                script.status === 'REVISION_REQUIRED' ? 'bg-red-900/60 text-red-400' :
                'bg-amber-900/60 text-amber-400'
              )}>
                {script.status.replace(/_/g, ' ')}
              </span>
            </div>
            
            {script.scriptText && (
              <div className="text-sm text-gray-300 bg-[#111] rounded-lg p-3 mt-3 border border-[#222] whitespace-pre-wrap max-h-64 overflow-y-auto">
                {script.scriptText}
              </div>
            )}

            {script.clientFeedback && script.status !== 'SENT_TO_CLIENT' && (
              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <p className="text-xs font-semibold text-amber-500 mb-1">Your Feedback:</p>
                <p className="text-xs text-gray-400">{script.clientFeedback}</p>
              </div>
            )}

            {script.status === 'SENT_TO_CLIENT' && (
              <div className="mt-4">
                {feedbackModal === script.id ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <textarea 
                      placeholder="Please detail your requested revisions..."
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none min-h-[100px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setFeedbackModal(null)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
                      <button 
                        onClick={() => handleAction(script.id, 'revision')}
                        disabled={loading === script.id || !feedback.trim()}
                        className="px-3 py-1.5 text-xs bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50"
                      >
                        {loading === script.id ? 'Submitting...' : 'Submit Revision Request'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(script.id, 'approve')}
                      disabled={loading === script.id}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      <CheckCircle size={13} /> {loading === script.id ? 'Approving...' : 'Approve Script'}
                    </button>
                    <button 
                      onClick={() => handleAction(script.id, 'revision')}
                      className="flex items-center gap-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      <XCircle size={13} /> Request Revision
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
