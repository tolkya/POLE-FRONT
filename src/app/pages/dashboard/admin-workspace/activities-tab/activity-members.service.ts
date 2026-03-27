import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ActivityMemberUser {
  email: string;
  firstName: string;
  lastName: string;
}

export interface ActivityMemberActivity {
  name: string;
}

export interface ActivityMember {
  id: number;
  member: ActivityMemberUser;
  activity: ActivityMemberActivity;
  role: string;
  status: string;
  createdAt: string;
}

export interface EnrollMemberDto {
  memberId: number;
  role: string;
}

interface HydraCollection<T> {
  member: T[];
  totalItems: number;
}

@Injectable({ providedIn: 'root' })
export class ActivityMembersService {
  constructor(private http: HttpClient) {}

  getMembers(activityId: number): Observable<ActivityMember[]> {
    return this.http
      .get<HydraCollection<ActivityMember>>(
        `${environment.api.baseUrl}/activities/${activityId}/members`,
        { headers: new HttpHeaders({ Accept: 'application/ld+json' }) }
      )
      .pipe(map((r) => r.member));
  }

  enrollMember(activityId: number, dto: EnrollMemberDto): Observable<ActivityMember> {
    return this.http.post<ActivityMember>(
      `${environment.api.baseUrl}/activities/${activityId}/members`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/ld+json' }) }
    );
  }

  patchStatus(id: number, status: string): Observable<ActivityMember> {
    return this.http.patch<ActivityMember>(
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