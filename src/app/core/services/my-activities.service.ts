import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HydraCollection } from '../models';
import { MyActivity } from '../models/user-activity.model';

@Injectable({ providedIn: 'root' })
export class MyActivitiesService {
  private readonly http = inject(HttpClient);

  readonly myActivities = signal<MyActivity[]>([]);

  fetchMyActivities(clubId: number): Observable<MyActivity[]> {
    return this.http
      .get<HydraCollection<MyActivity>>(
        `${environment.api.baseUrl}/me/activities?clubId=${clubId}`
      )
      .pipe(
        tap(res => this.myActivities.set(res.member)),
        map(res => res.member)
      );
  }

  joinActivity(activityId: number): Observable<MyActivity> {
    return this.http.post<MyActivity>(
      `${environment.api.baseUrl}/activities/${activityId}/join`,
      {}
    );
  }

  /** Retourne true si l'utilisateur est TEACHER sur l'activité donnée */
  isTeacherOf(activityId: number): boolean {
    return this.myActivities().some(
      a => a.activity.id === activityId && a.role === 'TEACHER'
    );
  }

    /** Annuler une demande PENDING — supprime la ligne */
  cancelRequest(userActivityId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/user-activities/${userActivityId}`
    );
  }

  /** Quitter une activité APPROVED → LEFT */
  leaveActivity(userActivityId: number): Observable<MyActivity> {
    return this.http.patch<MyActivity>(
      `${environment.api.baseUrl}/user-activities/${userActivityId}`,
      { status: 'LEFT' },
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }

  /** Redemander après REJECTED ou LEFT → PENDING */
  reRequestActivity(userActivityId: number): Observable<MyActivity> {
    return this.http.patch<MyActivity>(
      `${environment.api.baseUrl}/user-activities/${userActivityId}`,
      { status: 'PENDING' },
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }
}