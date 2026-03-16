import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface NotificationEvent {
  notifType: string;
  context: Record<string, string> | null;
  triggeredBy: { firstName: string; lastName: string } | null;
  createdAt: string;
}

export interface NotificationReceipt {
  id: number;
  isRead: boolean;
  createdAt: string;
  event: NotificationEvent;
}

interface HydraCollection<T> {
  'member': T[];
}

@Injectable({ providedIn: 'root' })
export class NotificationReceiptsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/notification-receipts`;

  getAll(): Observable<HydraCollection<NotificationReceipt>> {
    return this.http.get<HydraCollection<NotificationReceipt>>(this.baseUrl, {
      headers: new HttpHeaders({ Accept: 'application/ld+json' }),
    });
  }

  markAsRead(id: number): Observable<NotificationReceipt> {
    return this.http.patch<NotificationReceipt>(
      `${this.baseUrl}/${id}`,
      { isRead: true },
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }
}