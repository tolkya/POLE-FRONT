import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HydraCollection, ClubMember } from '../models';

@Injectable({ providedIn: 'root' })
export class ClubMembersService {
  constructor(private http: HttpClient) {}

  getMembers(clubId: number): Observable<ClubMember[]> {
    return this.http
      .get<HydraCollection<ClubMember>>(
        `${environment.api.baseUrl}/clubs/${clubId}/members`,
        { headers: new HttpHeaders({ Accept: 'application/ld+json' }) }
      )
      .pipe(map((r) => r.member));
  }
}
