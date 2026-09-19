import { db } from './db'

export type NotificationType = 'SYSTEM' | 'LEAD_ASSIGNED' | 'PROJECT_ASSIGNED' | 'SCRIPT_ASSIGNED' | 'SCRIPT_APPROVED' | 'SHOOT_SCHEDULED' | 'SHOOT_UPDATED' | 'VIDEO_REVIEW' | 'VIDEO_APPROVED' | 'REVISION_REQUESTED' | 'TASK_ASSIGNED' | 'DEADLINE_APPROACHING' | 'PAYMENT_RECEIVED'

type NotifyProps = {
  userId: string
  title: string
  message: string
  type: NotificationType
  linkUrl?: string
  entityType?: string
  entityId?: string
}

export async function createNotification(props: NotifyProps) {
  if (!props.userId) return null
  
  return db.notification.create({
    data: {
      userId: props.userId,
      title: props.title,
      message: props.message,
      type: props.type,
      linkUrl: props.linkUrl,
      entityType: props.entityType,
      entityId: props.entityId
    }
  })
}
