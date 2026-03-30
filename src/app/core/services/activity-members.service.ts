import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HydraCollection, UserActivity, EnrollMemberDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ActivityMembersService {
  constructor(private http: HttpClient) {}

  getMembers(activityId: number): Observable<UserActivity[]> {
    return this.http
      .get<HydraCollection<UserActivity>>(
        `${environment.api.baseUrl}/activities/${activityId}/members`,
        { headers: new HttpHeaders({ Accept: 'application/ld+json' }) }
      )
      .pipe(map((r) => r.member));
  }

  enrollMember(activityId: number, dto: EnrollMemberDto): Observable<UserActivity> {
    return this.http.post<UserActivity>(
      `${environment.api.baseUrl}/activities/${activityId}/members`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/ld+json' }) }
    );
  }

  patchStatus(id: number, status: string): Observable<UserActivity> {
    return this.http.patch<UserActivity>(
      `${environment.api.baseUrl}/user-activities/${id}`,
      { status },
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }

  deleteMembership(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/user-activities/${id}`
    );
  }
}
