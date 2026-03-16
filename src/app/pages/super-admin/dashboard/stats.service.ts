import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Stats {
  clubs: number;
  users: number;
  unreadNotifications: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);

  get(): Observable<Stats> {
    return this.http.get<Stats>(`${environment.api.baseUrl}/stats`);
  }
}