import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HydraCollection, ClubMember } from '../models';
import { ClubRole } from '../models/club-role.model';

export interface UserClubPatchDto {
  roles?: ClubRole[];
  validatedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ClubMembersService {
  private readonly patchHeaders = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

  constructor(private http: HttpClient) {}

  getMembers(clubId: number, filters?: { role?: string; search?: string; page?: number }): Observable<ClubMember[]> {
    let url = `${environment.api.baseUrl}/clubs/${clubId}/members`;
    const params: string[] = [];
    if (filters?.role)   params.push(`role=${encodeURIComponent(filters.role)}`);
    if (filters?.search) params.push(`search=${encodeURIComponent(filters.search)}`);
    if (filters?.page)   params.push(`page=${filters.page}`);
    if (params.length)   url += '?' + params.join('&');

    return this.http
      .get<HydraCollection<ClubMember>>(url, { headers: new HttpHeaders({ Accept: 'application/ld+json' }) })
      .pipe(map((r) => r.member));
  }

  patchUserClub(userClubId: number, dto: UserClubPatchDto): Observable<void> {
    return this.http.patch<void>(
      `${environment.api.baseUrl}/user-clubs/${userClubId}`,
      dto,
      { headers: this.patchHeaders }
    );
  }

  deleteUserClub(userClubId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/user-clubs/${userClubId}`
    );
  }
}