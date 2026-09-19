'use client'

import { useState, useTransition } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { Video, AlertTriangle, Search, X, CheckCircle, ExternalLink, Link as LinkIcon, User, Save, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

type VideoData = {
  id: string; clientId: string; orderId: string; scriptId: string | null; creatorId: string | null; shootId: string | null;
  assignedEditorId: string | null; title: string | null; deadline: Date | null; videoFileUrl: string | null;
  driveLink: string | null; thumbnailUrl: string | null; finalDeliveryUrl: string | null; revisionCount: number;
  currentVersion: number; status: string; internalNotes: string | null; deliveredAt: Date | null; createdAt: Date;
  client: { name: string };
  order: { packageName: string };
  creator: { name: string } | null;
  shoot: { scheduledDate: Date } | null;
  script: { videoNumber: number } | null;
  _count: { feedbackLogs: number };
}

type UserData = { id: string; name: string; role: string }

const stages = [
  { key: 'SCRIPT_APPROVED',     label: 'Script Approved',  color: 'border-purple-500/40 bg-purple-500/5', text: 'text-purple-400' },
  { key: 'SHOOT_PENDING',       label: 'Shoot Pending',    color: 'border-blue-500/40 bg-blue-500/5', text: 'text-blue-400' },
  { key: 'RAW_FOOTAGE_RECEIVED',label: 'Raw Footage',      color: 'border-indigo-500/40 bg-indigo-500/5', text: 'text-indigo-400' },
  { key: 'VIDEO_EDITING',       label: 'Editing',          color: 'border-cyan-500/40 bg-cyan-500/5', text: 'text-cyan-400' },
  { key: 'INTERNAL_QA',         label: 'Internal QA',      color: 'border-teal-500/40 bg-teal-500/5', text: 'text-teal-400' },
  { key: 'CLIENT_REVIEW',       label: 'Client Review',    color: 'border-amber-500/40 bg-amber-500/5', text: 'text-amber-400' },
  { key: 'REVISION',            label: 'Revision',         color: 'border-orange-500/40 bg-orange-500/5', text: 'text-orange-400' },
  { key: 'FINAL_APPROVED',      label: 'Final Approved',   color: 'border-green-500/40 bg-green-500/5', text: 'text-green-400' },
  { key: 'DELIVERED',           label: 'Delivered',        color: 'border-emerald-600/40 bg-emerald-600/5', text: 'text-emerald-400' },
]

export function VideoPipeline({ videos: initialVideos, users }: { videos: VideoData[], users: UserData[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // State
  const [videos, setVideos] = useState(initialVideos)
  const [search, setSearch] = useState('')
  const [editorFilter, setEditorFilter] = useState('ALL')
  const [urgencyFilter, setUrgencyFilter] = useState('ALL')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  
  // Detail Drawer State
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // API Call to Update Status
  const updateStatus = async (videoId: string, newStatus: string) => {
    // Optimistic UI update
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: newStatus } : v))
    if (selectedVideo?.id === videoId) setSelectedVideo(prev => prev ? { ...prev, status: newStatus } : null)

    const res = await fetch(`/api/videos/${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })

    if (!res.ok) {
      // Revert on fail
      alert("Failed to update status")
      router.refresh()
    }
  }

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.setData('text/plain', id)
  }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (!draggedId) return
    const video = videos.find(v => v.id === draggedId)
    if (video && video.status !== status) {
      updateStatus(draggedId, status)
    }
    setDraggedId(null)
  }

  // Filters
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const filteredVideos = videos.filter(v => {
    if (search && !v.client.name.toLowerCase().includes(search.toLowerCase()) && !v.id.includes(search)) return false
    if (editorFilter !== 'ALL' && v.assignedEditorId !== editorFilter) return false
    
    if (urgencyFilter !== 'ALL') {
      if (v.status === 'DELIVERED') return urgencyFilter === 'COMPLETED'
      if (!v.deadline) return false
      
      const d = new Date(v.deadline)
      d.setHours(0, 0, 0, 0)
      
      if (urgencyFilter === 'OVERDUE') return d < today
      if (urgencyFilter === 'TODAY') return d.getTime() === today.getTime()
      if (urgencyFilter === 'TOMORROW') return d.getTime() === tomorrow.getTime()
    }
    return true
  })

  const openDrawer = (video: VideoData) => {
    setSelectedVideo(video)
    setIsDrawerOpen(true)
  }

  return (
    <div className="relative">
      {/* Filters Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by client or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={editorFilter}
          onChange={e => setEditorFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">All Editors</option>
          {users.filter(u => u.role === 'EMPLOYEE' || u.role === 'ADMIN' || u.role === 'OWNER').map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <select
          value={urgencyFilter}
          onChange={e => setUrgencyFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">All Deadlines</option>
          <option value="OVERDUE">Overdue</option>
          <option value="TODAY">Due Today</option>
          <option value="TOMORROW">Due Tomorrow</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[60vh]">
        {stages.map(stage => {
          const columnVideos = filteredVideos.filter(v => v.status === stage.key)
          
          return (
            <div 
              key={stage.key} 
              className="flex-shrink-0 w-72 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              {/* Column Header */}
              <div className={cn('rounded-t-xl border border-b-0 px-4 py-3 sticky top-0', stage.color)}>
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-semibold uppercase tracking-wider', stage.text)}>
                    {stage.label}
                  </span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111] text-xs font-bold text-gray-400">
                    {columnVideos.length}
                  </span>
                </div>
              </div>
              
              {/* Column Body */}
              <div className={cn('rounded-b-xl border border-t-0 p-2 space-y-2 flex-1 transition-colors', stage.color, draggedId ? 'bg-opacity-20' : '')}>
                {columnVideos.map(video => {
                  const isOverdue = video.deadline && new Date(video.deadline) < today && video.status !== 'DELIVERED'
                  const isDueToday = video.deadline && new Date(video.deadline).getTime() === today.getTime() && video.status !== 'DELIVERED'
                  const assignedUser = users.find(u => u.id === video.assignedEditorId)

                  return (
                    <div
                      key={video.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, video.id)}
                      onClick={() => openDrawer(video)}
                      className={cn(
                        "rounded-lg border bg-[#111] p-3 cursor-grab active:cursor-grabbing hover:border-amber-500/50 transition-all",
                        isOverdue ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 
                        isDueToday ? 'border-yellow-500/50' : 'border-[#2a2a2a]'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] text-gray-500 font-mono">#{video.id.slice(-6)}</span>
                        {video.revisionCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Rev {video.revisionCount}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm font-semibold text-white mb-1 leading-tight">
                        {video.client.name}
                      </p>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {video.script ? `Script #${video.script.videoNumber}` : 'Unlinked script'}
                        </p>
                        {assignedUser && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <User size={10} />
                            <span className="truncate">{assignedUser.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e1e1e]">
                        <div className="flex items-center gap-1.5">
                          {video.driveLink && <LinkIcon size={12} className="text-blue-400" />}
                          {video._count.feedbackLogs > 0 && <span className="text-[10px] text-amber-500">{video._count.feedbackLogs} notes</span>}
                        </div>
                        
                        {video.deadline && (
                          <div className={cn(
                            'text-[10px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded',
                            isOverdue ? 'bg-red-500/10 text-red-400' : 
                            isDueToday ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-500'
                          )}>
                            {(isOverdue || isDueToday) && <AlertTriangle size={10} />}
                            {formatDate(video.deadline)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {columnVideos.length === 0 && (
                  <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-[#222]">
                    <span className="text-xs text-gray-700">Drop here</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Details Drawer Overlay */}
      {isDrawerOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-[#111] border-l border-[#222] h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#1a1a1a] sticky top-0 z-10">
              <div>
                <h2 className="font-semibold text-white">Video Details</h2>
                <p className="text-xs text-gray-500 font-mono">#{selectedVideo.id}</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#222]">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 space-y-6">
              
              {/* Status Updater */}
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Pipeline Status</label>
                <select
                  value={selectedVideo.status}
                  onChange={(e) => updateStatus(selectedVideo.id, e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                {selectedVideo.status === 'REVISION' && (
                  <p className="mt-2 text-[10px] text-orange-400 flex items-center gap-1">
                    <AlertTriangle size={10} /> Needs editor attention (Rev {selectedVideo.revisionCount})
                  </p>
                )}
                {selectedVideo.status === 'DELIVERED' && (
                  <p className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={10} /> Delivered (Quota updated)
                  </p>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Client</p>
                  <p className="text-sm font-medium text-gray-200">{selectedVideo.client.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Order</p>
                  <p className="text-sm font-medium text-gray-200 line-clamp-1">{selectedVideo.order.packageName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Script</p>
                  <p className="text-sm font-medium text-gray-200">
                    {selectedVideo.script ? `Video #${selectedVideo.script.videoNumber}` : 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Deadline</p>
                  <p className={cn("text-sm font-medium", selectedVideo.deadline && new Date(selectedVideo.deadline) < today && selectedVideo.status !== 'DELIVERED' ? 'text-red-400' : 'text-gray-200')}>
                    {selectedVideo.deadline ? formatDate(selectedVideo.deadline) : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Editor Assignment */}
              <div>
                <label className="block text-[10px] text-gray-500 uppercase mb-1.5">Assigned Editor</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVideo.assignedEditorId || ''}
                    onChange={async (e) => {
                      const newId = e.target.value || null
                      setSelectedVideo(prev => prev ? { ...prev, assignedEditorId: newId } : null)
                      setVideos(prev => prev.map(v => v.id === selectedVideo.id ? { ...v, assignedEditorId: newId } : v))
                      await fetch(`/api/videos/${selectedVideo.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assignedEditorId: newId })
                      })
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Unassigned</option>
                    {users.filter(u => u.role === 'EMPLOYEE' || u.role === 'ADMIN').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4 pt-4 border-t border-[#222]">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase mb-1.5">Drive / Working Link</label>
                  <input
                    type="url"
                    defaultValue={selectedVideo.driveLink || ''}
                    onBlur={async (e) => {
                      if (e.target.value !== selectedVideo.driveLink) {
                        setSelectedVideo(prev => prev ? { ...prev, driveLink: e.target.value } : null)
                        await fetch(`/api/videos/${selectedVideo.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ driveLink: e.target.value })
                        })
                      }
                    }}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                {(selectedVideo.status === 'FINAL_APPROVED' || selectedVideo.status === 'DELIVERED') && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[10px] text-emerald-500 font-bold uppercase mb-1.5">Final Delivery Link</label>
                    <input
                      type="url"
                      defaultValue={selectedVideo.finalDeliveryUrl || ''}
                      onBlur={async (e) => {
                        if (e.target.value !== selectedVideo.finalDeliveryUrl) {
                          setSelectedVideo(prev => prev ? { ...prev, finalDeliveryUrl: e.target.value } : null)
                          await fetch(`/api/videos/${selectedVideo.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ finalDeliveryUrl: e.target.value })
                          })
                        }
                      }}
                      placeholder="https://vimeo.com/..."
                      className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-emerald-500/30 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Internal Notes */}
              <div className="pt-4 border-t border-[#222]">
                <label className="block text-[10px] text-gray-500 uppercase mb-1.5">Internal Notes</label>
                <textarea
                  defaultValue={selectedVideo.internalNotes || ''}
                  onBlur={async (e) => {
                    if (e.target.value !== selectedVideo.internalNotes) {
                      setSelectedVideo(prev => prev ? { ...prev, internalNotes: e.target.value } : null)
                      await fetch(`/api/videos/${selectedVideo.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ internalNotes: e.target.value })
                      })
                    }
                  }}
                  rows={3}
                  placeholder="Notes for the team..."
                  className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
