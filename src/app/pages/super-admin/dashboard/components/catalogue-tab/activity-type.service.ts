import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface ActivityType {
  id: number;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

export interface ActivityTypeCreateDto {
  name: string;
  description?: string;
}

interface HydraCollection<T> {
  member: T[];
}

@Injectable({ providedIn: 'root' })
export class ActivityTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/activity-types`;

  getAll(): Observable<ActivityType[]> {
    return this.http
      .get<HydraCollection<ActivityType>>(this.baseUrl, {
        headers: new HttpHeaders({ Accept: 'application/ld+json' }),
      })
      .pipe(map((r) => r.member));
  }

  create(dto: ActivityTypeCreateDto): Observable<ActivityType> {
    return this.http.post<ActivityType>(this.baseUrl, dto, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  toggleStatus(id: number, status: 'ACTIVE' | 'BLOCKED'): Observable<ActivityType> {
    return this.http.patch<ActivityType>(
      `${this.baseUrl}/${id}`,
      { status },
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}