import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserPasswordChangeDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  updateProfile(
    id: number,
    payload: Partial<Pick<User, 'email' | 'firstName' | 'lastName' | 'phone'>>
  ): Observable<User> {
    return this.http.patch<User>(
      `${environment.api.baseUrl}/users/${id}`,
      payload,
      { headers: { 'Content-Type': 'application/merge-patch+json' } }
    );
  }

  changePassword(id: number, payload: UserPasswordChangeDto): Observable<void> {
    return this.http.post<void>(
      `${environment.api.baseUrl}/users/${id}/change-password`,
      payload
    );
  }
}