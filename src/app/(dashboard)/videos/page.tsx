import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { VideoPipeline } from '@/components/videos/VideoPipeline'

export default async function VideosPage() {
  const [videos, users] = await Promise.all([
    db.video.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client:  { select: { name: true } },
        order:   { select: { packageName: true } },
        creator: { select: { name: true } },
        shoot:   { select: { scheduledDate: true } },
        script:  { select: { videoNumber: true } },
        _count:  { select: { feedbackLogs: true } },
      },
    }),
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true }
    })
  ])

  return (
    <div>
      <Topbar title="Video Pipeline" subtitle="End-to-end video production tracking" />
      <div className="p-6">
        <VideoPipeline videos={videos} users={users} />
      </div>
    </div>
  )
}
