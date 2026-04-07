import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HydraCollection, Activity, ActivityType, ActivityCreateDto, ActivityUpdateDto } from '../models';

@Injectable({ providedIn: 'root' })
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

  updateActivity(activityId: number, dto: ActivityUpdateDto): Observable<Activity> {
    return this.http.patch<Activity>(
      `${environment.api.baseUrl}/activities/${activityId}`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
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

  getAllActivityTypes(): Observable<ActivityType[]> {
    return this.http
      .get<HydraCollection<ActivityType>>(
        `${environment.api.baseUrl}/activity-types`,
        { headers: new HttpHeaders({ Accept: 'application/ld+json' }) }
      )
      .pipe(map((r) => r.member));
  }

  createActivityType(dto: { name: string; description?: string }): Observable<ActivityType> {
    return this.http.post<ActivityType>(
      `${environment.api.baseUrl}/activity-types`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }
}
