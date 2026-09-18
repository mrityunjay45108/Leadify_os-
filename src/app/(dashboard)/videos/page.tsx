import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/db'
import { VideoPipeline } from '@/components/videos/VideoPipeline'

export default async function VideosPage() {
  const videos = await db.video.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client:  { select: { name: true } },
      creator: { select: { name: true } },
      script:  { select: { videoNumber: true } },
      _count:  { select: { feedbackLogs: true } },
    },
  })

  return (
    <div>
      <Topbar title="Videos" subtitle="9-stage production pipeline tracker" />
      <div className="p-6">
        <VideoPipeline videos={videos} />
      </div>
    </div>
  )
}
