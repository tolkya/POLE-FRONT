import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Club, ClubCreateDto, ClubUpdateDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ClubService {
  constructor(private http: HttpClient) {}

  getClub(id: number): Observable<Club> {
    return this.http.get<Club>(`${environment.api.baseUrl}/clubs/${id}`);
  }

  updateClub(id: number, data: ClubUpdateDto): Observable<Club> {
    return this.http.patch<Club>(
      `${environment.api.baseUrl}/clubs/${id}`,
      data,
      { headers: { 'Content-Type': 'application/merge-patch+json' } }
    );
  }

  createClub(data: ClubCreateDto): Observable<Club> {
    return this.http.post<Club>(`${environment.api.baseUrl}/clubs`, data);
  }

  joinClub(clubCode: string): Observable<void> {
    return this.http.post<void>(
      `${environment.api.baseUrl}/user-clubs/join`,
      { clubCode }
    );
  }

  leaveClub(userClubId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/user-clubs/${userClubId}`
    );
  }
}
