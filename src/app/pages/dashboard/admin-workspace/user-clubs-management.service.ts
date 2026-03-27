import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ClubRole = 'ADMIN' | 'TEACHER' | 'SECRETARY' | 'MEMBER' | 'USER';

export const CLUB_ROLE_OPTIONS: { label: string; value: ClubRole }[] = [
  { label: 'Admin',      value: 'ADMIN' },
  { label: 'Professeur', value: 'TEACHER' },
  { label: 'Secrétaire', value: 'SECRETARY' },
  { label: 'Membre',     value: 'MEMBER' },
];

export const CLUB_ROLE_LABELS: Record<ClubRole, string> = {
  ADMIN:     'Admin',
  TEACHER:   'Professeur',
  SECRETARY: 'Secrétaire',
  MEMBER:    'Membre',
  USER:      'En attente',
};

export interface UserClubPatchDto {
  roles?: ClubRole[];
  validatedAt?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserClubsManagementService {
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/merge-patch+json',
  });

  constructor(private http: HttpClient) {}

  patch(userClubId: number, dto: UserClubPatchDto): Observable<void> {
    return this.http.patch<void>(
      `${environment.api.baseUrl}/user-clubs/${userClubId}`,
      dto,
      { headers: this.headers }
    );
  }

  delete(userClubId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/user-clubs/${userClubId}`
    );
  }
}