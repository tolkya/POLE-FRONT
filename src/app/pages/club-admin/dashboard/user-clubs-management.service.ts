import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserClubPatchDto {
  roles?: string[];
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