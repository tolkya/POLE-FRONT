import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClubAdminRegistrationPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  plainPassword: string;
  clubName: string;
}

export interface ClubAdminRegistrationResponse {
  userId: number;
  clubCode: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClubAdminRegistration {
  private readonly http = inject(HttpClient);

  register(payload: ClubAdminRegistrationPayload): Observable<ClubAdminRegistrationResponse> {
    return this.http.post<ClubAdminRegistrationResponse>(
      `${environment.api.baseUrl}/register/club-admin`,
      payload
    );
  }
}