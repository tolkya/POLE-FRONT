import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ActivityType {
  id: number;
  name: string;
}

export interface Activity {
  id: number;
  name: string;
  description: string | null;
  status: string;
  activityType: ActivityType;
  createdAt: string;
}

export interface ActivityCreateDto {
  name: string;
  description?: string;
  activityType: string; // IRI : /api/activity-types/{id}
}

interface HydraCollection<T> {
  member: T[];
  totalItems: number;
}

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  constructor(private http: HttpClient) {}

  getActivities(clubId: number): Observable<Activity[]> {
    return this.http
      .get<HydraCollection<Activity>>(
        `${environment.api.baseUrl}/clubs/${clubId}/activities`,
        { headers: new HttpHeaders({ Accept: 'application/ld+json' }) }
      )
      .pipe(map((r) => r.member));
  }

  createActivity(clubId: number, dto: ActivityCreateDto): Observable<Activity> {
    return this.http.post<Activity>(
      `${environment.api.baseUrl}/clubs/${clubId}/activities`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  deleteActivity(activityId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/activities/${activityId}`
    );
  }

  searchActivityTypes(name: string): Observable<ActivityType[]> {
    return this.http
      .get<HydraCollection<ActivityType>>(
        `${environment.api.baseUrl}/activity-types?name=${encodeURIComponent(name)}`,
        { headers: new HttpHeaders({ Accept: 'application/ld+json' }) }
      )
      .pipe(map((r) => r.member));
  }
}