import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserRegistrationPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  plainPassword: string;
  clubCode: string;
}

export interface UserRegistrationResponse {
  userId: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserRegistrationService {
  private readonly http = inject(HttpClient);

  register(payload: UserRegistrationPayload): Observable<UserRegistrationResponse> {
    return this.http.post<UserRegistrationResponse>(
      `${environment.api.baseUrl}/register`,
      payload
    );
  }
}