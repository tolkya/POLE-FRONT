import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HydraCollection, NotificationReceipt } from '../../../core/models';

export type { NotificationReceipt };

@Injectable({ providedIn: 'root' })
export class NotificationReceiptsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/notification-receipts`;

  getAll(): Observable<NotificationReceipt[]> {
    return this.http
      .get<HydraCollection<NotificationReceipt>>(this.baseUrl, {
        headers: new HttpHeaders({ Accept: 'application/ld+json' }),
      })
      .pipe(map((r) => r.member));
  }

  markAsRead(id: number): Observable<NotificationReceipt> {
    return this.http.patch<NotificationReceipt>(
      `${this.baseUrl}/${id}`,
      { isRead: true },
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }
}