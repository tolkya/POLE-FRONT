import { UserRef } from './api.model';

export interface NotificationEvent {
  notifType: string;
  context: Record<string, string> | null;
  triggeredBy: UserRef | null;
  createdAt: string;
}

export interface NotificationReceipt {
  id: number;
  isRead: boolean;
  createdAt: string;
  event: NotificationEvent;
}
